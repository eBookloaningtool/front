<template>
  <div class="cart-list">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载购物车...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="ri-error-warning-line"></i>
      <p>{{ error }}</p>
      <button @click="fetchCartItems" class="retry-btn">重试</button>
    </div>

    <div v-else-if="cartItems.length === 0" class="empty-state">
      <i class="ri-shopping-cart-line"></i>
      <p>购物车是空的</p>
      <slot name="empty-action"></slot>
    </div>

    <template v-else>
      <div class="cart-items">
        <ShoppingCartItem
          v-for="book in cartItems"
          :key="book.bookId"
          :book="book"
          @remove="handleRemoveItem"
        />
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>总计: {{ cartItems.length }} 本书</span>
          <span class="total-price">£{{ totalPrice.toFixed(2) }}</span>
        </div>
        <slot name="cart-actions"></slot>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { getCartItems, removeFromCart } from '../api/cart.ts';
import { useToast } from '../composables/useToast';
import ShoppingCartItem from './ShoppingCartItem.vue';

const props = defineProps({
  autoLoad: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:cartItems', 'cart-updated']);

const cartItems = ref([]);
const isLoading = ref(false);
const error = ref(null);
const removingItems = ref(new Set());
const { showToast } = useToast();

// 计算总价
const totalPrice = computed(() => {
  return cartItems.value.length * 5;
});

// 获取购物车数据并关联书籍详情
const fetchCartItems = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // 获取购物车书籍ID列表
    const result = await getCartItems();

    // 确保result.bookId是数组
    const bookIds = Array.isArray(result.bookId) ? result.bookId : [];

    console.log('获取到购物车ID列表:', bookIds);

    // 如果购物车为空
    if (bookIds.length === 0) {
      cartItems.value = [];
      emit('update:cartItems', []);
      emit('cart-updated', []);
      isLoading.value = false;
      return;
    }

    // 获取所有书籍详情
    try {
      const bookDetailsPromises = bookIds.map(bookId => {
        if (!bookId) {
          console.error('发现无效的bookId:', bookId);
          return null;
        }

        // 首先尝试从本地缓存获取
        const cachedBook = localStorage.getItem(`book_${bookId}`);
        if (cachedBook) {
          try {
            const bookData = JSON.parse(cachedBook);
            console.log('从缓存加载书籍:', bookId, bookData);
            return Promise.resolve(bookData);
          } catch (parseError) {
            console.error('解析缓存的书籍数据失败:', parseError);
          }
        }

        // 如果缓存不存在或解析失败，则从API获取
        return fetch(`/api/books/get?bookId=${bookId}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`获取书籍 ${bookId} 详情失败: ${response.status}`);
            }
            return response.json();
          })
          .then(bookData => {
            // 缓存获取到的书籍数据
            localStorage.setItem(`book_${bookId}`, JSON.stringify(bookData));
            return bookData;
          })
          .catch(err => {
            console.error(`获取书籍 ${bookId} 详情失败:`, err);
            // 返回带有基本信息的占位对象
            return {
              bookId: bookId,
              title: `加载中...`,
              author: '加载中...',
              price: 0,
              coverUrl: '/images/default-book-cover.jpg'
            };
          });
      });

      // 过滤掉无效的请求
      const validPromises = bookDetailsPromises.filter(p => p !== null);
      const booksDetails = await Promise.all(validPromises);

      // 过滤并处理书籍数据
      const processedBooks = booksDetails
        .filter(book => book && (book.bookId || book.id)) // 确保书籍有ID
        .map(book => {
          // 确保bookId字段存在
          if (!book.bookId && book.id) {
            book.bookId = book.id;
          }

          // 确保关键字段有合理的默认值
          return {
            ...book,
            title: book.title || '未知书籍',
            author: book.author || '未知作者',
            price: book.price || 0,
            coverUrl: book.coverUrl || '/images/default-book-cover.jpg'
          };
        });

      cartItems.value = processedBooks;

      // 触发更新事件
      emit('update:cartItems', cartItems.value);
      emit('cart-updated', cartItems.value);
    } catch (detailsError) {
      console.error('获取书籍详情失败:', detailsError);
      error.value = '加载书籍详情失败，请重试';
    }
  } catch (err) {
    console.error('获取购物车数据错误:', err);
    error.value = '加载购物车失败，请重试';
  } finally {
    isLoading.value = false;
  }
};

// 从购物车移除商品
const handleRemoveItem = async (bookId) => {
  if (!bookId || removingItems.value.has(bookId)) return;

  removingItems.value.add(bookId);

  try {
    const result = await removeFromCart(bookId);

    if (result.state === 'success') {
      // 更新本地购物车数据
      cartItems.value = cartItems.value.filter(item => item.bookId !== bookId);
      emit('update:cartItems', cartItems.value);
      emit('cart-updated', cartItems.value);

      showToast('商品已从购物车中移除', 'success');
    } else {
      throw new Error('移除购物车商品失败');
    }
  } catch (err) {
    console.error('移除购物车商品错误:', err);
    showToast('移除商品失败，请重试', 'error');
  } finally {
    removingItems.value.delete(bookId);
  }
};

// 自动加载购物车数据
onMounted(() => {
  if (props.autoLoad) {
    fetchCartItems();
  }
});

// 暴露方法供父组件调用
defineExpose({
  fetchCartItems,
  removeItem: handleRemoveItem
});
</script>

<style scoped>
.cart-list {
  width: 100%;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  padding: 30px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(233, 168, 76, 0.2);
  border-radius: 50%;
  border-top-color: #e9a84c;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state i,
.empty-state i {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 15px;
}

.error-state {
  color: #f44336;
}

.error-state i {
  color: #f44336;
}

.retry-btn {
  margin-top: 15px;
  background-color: #e9a84c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}

.cart-items {
  margin-bottom: 20px;
}

.cart-summary {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  margin-bottom: 10px;
}

.total-price {
  font-size: 20px;
  font-weight: 600;
  color: #e9a84c;
}
</style>
