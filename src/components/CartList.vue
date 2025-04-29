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
          v-for="item in cartItems"
          :key="item.bookId"
          :item="item"
          @update:quantity="updateQuantity"
          @remove="handleRemoveItem"
        />
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>总计: {{ cartItems.length }} 本书</span>
          <span class="total-price">￡{{ totalPrice.toFixed(2) }}</span>
        </div>
        <slot name="cart-actions"></slot>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { cartAPI, bookAPI } from '../services/api';
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
const total = ref(0);

// 计算总价
const totalPrice = computed(() => {
  return total.value;
});

const fetchCartItems = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // 首先尝试从本地存储获取购物车数据
    const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    console.log('本地购物车数据:', localCart);

    if (localCart && localCart.length > 0) {
      // 获取每个书籍的详细信息
      const bookDetails = await Promise.all(
        localCart.map(async (item) => {
          try {
            const bookResponse = await bookAPI.getBookDetail(item.bookId);
            return {
              bookId: item.bookId,
              title: bookResponse.data.title,
              author: bookResponse.data.author,
              price: bookResponse.data.price,
              coverUrl: bookResponse.data.coverUrl,
              quantity: 1
            };
          } catch (err) {
            console.error(`获取书籍 ${item.bookId} 详情失败:`, err);
            return null;
          }
        })
      );
      
      // 过滤掉获取失败的书籍
      cartItems.value = bookDetails.filter(Boolean);
      calculateTotal();
    } else {
      cartItems.value = [];
      calculateTotal();
    }
  } catch (err) {
    console.error('获取购物车失败:', err);
    error.value = '获取购物车失败，请稍后重试';
  } finally {
    isLoading.value = false;
  }
};

const calculateTotal = () => {
  total.value = cartItems.value.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
};

const updateQuantity = async (itemId, newQuantity) => {
  try {
    await cartAPI.updateCartItem(itemId, newQuantity);
    await fetchCartItems();
  } catch (err) {
    console.error('更新购物车失败:', err);
    error.value = '更新购物车失败，请稍后重试';
  }
};

const removeItem = async (itemId) => {
  try {
    await cartAPI.removeFromCart(itemId);
    await fetchCartItems();
  } catch (err) {
    console.error('删除购物车项失败:', err);
    error.value = '删除购物车项失败，请稍后重试';
  }
};

// 从购物车移除商品
const handleRemoveItem = async (bookId) => {
  if (!bookId || removingItems.value.has(bookId)) return;

  removingItems.value.add(bookId);

  try {
    await removeItem(bookId);

    showToast('商品已从购物车中移除', 'success');
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
