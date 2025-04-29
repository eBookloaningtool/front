<!-- ShoppingCart.vue -->
<template>
  <div class="shopping-cart-container">
    <h1 class="cart-title">我的购物车</h1>

    <CartList v-model:cartItems="cartItems" @cart-updated="handleCartUpdated" @remove-item="removeFromCart">
      <!-- 空购物车时的操作按钮 -->
      <template #empty-action>
        <router-link to="/" class="browse-books-btn">
          <i class="ri-book-open-line"></i>
          浏览书籍
        </router-link>
      </template>

      <!-- 购物车操作按钮 -->
      <template #cart-actions>
        <div class="cart-actions">
          <button class="checkout-btn" @click="checkout" :disabled="isProcessing">
            <i class="ri-shopping-bag-line"></i>
            借阅
          </button>
          <button class="clear-cart-btn" @click="handleClearCart" :disabled="isProcessing">清空购物车</button>
        </div>
      </template>
    </CartList>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CartList from '@/components/CartList.vue';
import { useToast } from '@/composables/useToast';
import { getWishlist, removeFromWishlist as removeWishlistItem } from '../api/wishlist';
import { clearCart, removeFromCart as apiRemoveFromCart } from '@/api/cart';
import { borrowBook } from '@/api/borrowApi';

const router = useRouter();
const cartItems = ref([]);
const { showToast } = useToast();
const isProcessing = ref(false);

// 在组件挂载时加载购物车数据
onMounted(() => {
  loadCartItems();
});

// 从localStorage加载购物车数据
const loadCartItems = () => {
  try {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      cartItems.value = JSON.parse(savedCart);
      console.log('已加载购物车数据:', cartItems.value);
    } else {
      console.log('购物车为空');
    }
  } catch (err) {
    console.error('加载购物车数据失败:', err);
    showToast('加载购物车数据失败', 'error');
  }
};

// 保存购物车数据到localStorage
const saveCartItems = () => {
  try {
    localStorage.setItem('cartItems', JSON.stringify(cartItems.value));
    console.log('购物车数据已保存');
  } catch (err) {
    console.error('保存购物车数据失败:', err);
    showToast('保存购物车数据失败', 'error');
  }
};

// 从购物车中删除商品
const removeFromCart = async (bookId) => {
  try {
    console.log('删除购物车商品:', bookId);

    // 调用API从服务器购物车中移除
    await apiRemoveFromCart(bookId);

    // 使用filter更新本地购物车
    cartItems.value = cartItems.value.filter(item => item.bookId !== bookId);
    // 保存更新后的购物车
    saveCartItems();
    showToast('商品已从购物车中移除', 'success');
  } catch (err) {
    console.error('从购物车移除失败:', err);
    showToast('从购物车移除失败', 'error');
  }
};

// 处理购物车更新事件
const handleCartUpdated = (items) => {
  console.log('购物车已更新:', items);
  cartItems.value = items;
  saveCartItems();
};

// 结账功能
const checkout = async () => {
  if (cartItems.value.length === 0) {
    showToast('购物车为空，无法借阅', 'warning');
    return;
  }

  if (isProcessing.value) return;
  isProcessing.value = true;

  try {
    // 获取所有书籍ID
    const bookIds = cartItems.value.map(item => item.bookId);

    // 调用借阅API批量借阅
    const result = await borrowBook(bookIds);

    if (result.state === 'success') {
      // 借阅成功
      // 保存借阅信息到localStorage
      const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');

      // 为每本书添加借阅信息
      cartItems.value.forEach(item => {
        borrowedBooks.push({
          bookId: item.bookId,
          title: item.title,
          cover: item.cover || item.coverUrl,
          author: item.author,
          dueDate: result.dueDate,
          borrowDate: new Date().toISOString().split('T')[0]
        });
      });

      // 保存更新后的借阅信息
      localStorage.setItem('borrowedBooks', JSON.stringify(borrowedBooks));

      // 清空本地购物车
      cartItems.value = [];
      saveCartItems();

      // 调用API清空服务器购物车
      await clearCart();

      // 显示成功消息
      showToast(`借阅成功！到期日期: ${result.dueDate}，余额: ${result.balance}元`, 'success');

      // 跳转到我的借阅页面
      setTimeout(() => {
        router.push('/user/books');
      }, 1500);
    } else if (result.state === 'insufficient balance') {
      // 余额不足
      showToast(`余额不足，需要充值${result.newPayment}元`, 'error');
      setTimeout(() => {
        router.push('/user/topup');
      }, 1500);
    } else if (result.state === 'Reach borrow limit') {
      // 达到借阅上限
      showToast('您已达到借阅上限', 'error');
    } else if (result.state === 'Borrow failed.') {
      // 部分书籍借阅失败
      let message = '部分书籍借阅失败: ';
      let failedBookIds = [];

      if (result.InvalidBookIds && result.InvalidBookIds.length > 0) {
        message += `${result.InvalidBookIds.length}本书不可用; `;
        failedBookIds = [...failedBookIds, ...result.InvalidBookIds];
      }

      if (result.LowStockBookIds && result.LowStockBookIds.length > 0) {
        message += `${result.LowStockBookIds.length}本书库存不足; `;
        failedBookIds = [...failedBookIds, ...result.LowStockBookIds];
      }

      if (result.BorrowedBookIds && result.BorrowedBookIds.length > 0) {
        message += `${result.BorrowedBookIds.length}本书您已借阅过; `;
        failedBookIds = [...failedBookIds, ...result.BorrowedBookIds];
      }

      // 更新购物车，只保留失败的书籍
      if (failedBookIds.length > 0) {
        cartItems.value = cartItems.value.filter(item => failedBookIds.includes(item.bookId));
        saveCartItems();

        // 显示部分成功的消息
        const successCount = bookIds.length - failedBookIds.length;
        if (successCount > 0) {
          message += `成功借阅了${successCount}本书。`;
        }
      }

      showToast(message, 'warning');
    } else {
      // 其他错误
      showToast('借阅失败，请稍后重试', 'error');
    }
  } catch (error) {
    console.error('借阅过程中出错:', error);
    showToast('借阅失败，请稍后重试', 'error');
  } finally {
    isProcessing.value = false;
  }
};

// 从愿望清单中删除商品
const removeItemFromWishlist = async (bookId) => {
  try {
    await removeWishlistItem(bookId);
    showToast('已从愿望清单移除', 'success');
  } catch (err) {
    console.error('从愿望清单移除失败:', err);
    showToast('从愿望清单移除失败', 'error');
  }
};

// 清空购物车方法
const handleClearCart = async () => {
  if (cartItems.value.length === 0) {
    showToast('购物车已经为空', 'info');
    return;
  }

  if (isProcessing.value) return;
  isProcessing.value = true;

  try {
    // 调用API清空购物车
    const result = await clearCart();

    if (result.state === 'success') {
      // 更新本地购物车数据
      cartItems.value = [];
      saveCartItems();
      // 显示成功消息
      showToast('购物车已清空', 'success');
    } else {
      // 清空失败
      showToast('清空购物车失败，请稍后重试', 'error');
    }
  } catch (error) {
    console.error('清空购物车失败:', error);
    showToast('清空购物车失败，请稍后重试', 'error');
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
.shopping-cart-container {
  max-width: 1200px;
  margin: 20px 40px;
  padding: 30px;
  padding-top: 100px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.cart-title {
  font-size: 32px;
  color: #333;
  margin-bottom: 40px;
  padding-bottom: 15px;
  border-bottom: 3px solid #e9a84c;
  margin-top: 20px;
  text-align: left;
  font-weight: 600;
  width: 100%;
  max-width: 1200px;
  margin-left: 0;
  margin-right: 0;
}

.browse-books-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #e9a84c;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  margin-top: 20px;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: 500;
}

.browse-books-btn:hover {
  background: #d89b3f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(233, 168, 76, 0.2);
}

.cart-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 30px;
  gap: 15px;
}

.checkout-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 15px;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.checkout-btn:hover {
  background: #3d9140;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.clear-cart-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 0;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.2);
}

.clear-cart-btn:hover {
  background: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

@media (max-width: 768px) {
  .shopping-cart-container {
    margin: 10px 20px;
    padding: 20px;
    padding-top: 80px;
  }

  .cart-title {
    font-size: 28px;
    margin-bottom: 30px;
    max-width: 100%;
  }

  .cart-actions {
    flex-direction: column;
    gap: 10px;
  }

  .checkout-btn,
  .clear-cart-btn {
    width: 100%;
    justify-content: center;
    margin-right: 0;
  }
}
</style>
