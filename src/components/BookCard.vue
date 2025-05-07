<template>
  <div class="book-card" @click="navigateToDetail">
    <div class="book-cover">
      <BookCover :src="book.cover || book.coverUrl || fallbackCover" :alt="book.title" />

      <!-- 心愿单按钮 -->
      <div v-if="showWishlist" class="wishlist-button-container" @click.stop>
        <button
          @click="toggleWishlist"
          :disabled="loading"
          class="wishlist-btn"
          :class="{ 'active': isInWishlist, 'loading': loading }"
          :title="isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
        >
          <i v-if="loading" class="ri-loader-4-line loading-icon"></i>
          <i v-else-if="isInWishlist" class="ri-heart-fill"></i>
          <i v-else class="ri-heart-line"></i>
        </button>
      </div>
    </div>

    <h3 class="book-title">{{ book.title || '未命名书籍' }}</h3>
    <p class="book-author">{{ book.author || '未知作者' }}</p>
    <p class="book-price">£{{ book.price?.toFixed(2) || '0.00' }}</p>

    <div class="book-rating" v-if="showRating">
      <div class="stars">
        <i v-for="n in 5"
           :key="n"
           :class="['ri-star-' + (n <= (book.rating || 0) ? 'fill' : 'line')]">
        </i>
      </div>
      <span class="rating-count">Available</span>
    </div>

    <div class="book-actions">
      <button
        class="borrow-btn"
        :class="{ 'not-available': !isAvailable || isAlreadyBorrowed, 'already-borrowed': isAlreadyBorrowed, 'loading': isBorrowing }"
        :disabled="!isAvailable || isBorrowing || isAlreadyBorrowed"
        @click.stop="handleBorrow"
      >
        <i v-if="isBorrowing" class="ri-loader-4-line loading-icon"></i>
        <i v-else-if="isAlreadyBorrowed" class="ri-book-mark-fill"></i>
        {{ isAlreadyBorrowed ? 'Already Borrowed' : isAvailable ? (isBorrowing ? 'Borrowing...' : 'Borrow') : 'Not Available' }}
      </button>

      <AddToCartButton
        v-if="showCart"
        :book-id="book.bookId"
        @click.stop
        class="cart-btn-container"
        @not-logged-in="showToast('Please login first', 'error')"
      />
    </div>
  </div>

  <!-- 使用Teleport将模态框传送到body元素 -->
  <Teleport to="body">
    <!-- 余额不足提示框 -->
    <div v-if="showBalanceDialog" class="modal-overlay" @click="showBalanceDialog = false">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="showBalanceDialog = false">&times;</button>
        <div class="error-message">
          <div class="error-icon">
            <i class="ri-error-warning-line"></i>
          </div>
          <h3>Insufficient Balance</h3>
          <p>Your account balance is insufficient. You need to top up {{ requiredAmount }} to borrow this book</p>
          <div class="modal-actions">
            <button class="cancel-btn" @click="showBalanceDialog = false">Cancel</button>
            <button class="topup-btn" @click="goToTopUp">Top up</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 已借阅提示框 -->
    <div v-if="showAlreadyBorrowedDialog" class="modal-overlay" @click="showAlreadyBorrowedDialog = false">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="showAlreadyBorrowedDialog = false">&times;</button>
        <div class="info-message">
          <div class="info-icon">
            <i class="ri-information-line"></i>
          </div>
          <h3>Already Borrowed</h3>
          <p>You have already borrowed this book. You can access it from your borrowing list.</p>
          <div class="modal-actions">
            <button class="cancel-btn" @click="showAlreadyBorrowedDialog = false">Close</button>
            <button class="view-btn" @click="goToMyBooks">View My Books</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import AddToCartButton from './AddToCartButton.vue';
import BookCover from './BookCover.vue';
import { borrowBook, getBorrowList } from '../api/borrowApi.ts';
import { useToast } from '../composables/useToast';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlist';

const props = defineProps({
  book: { type: Object, required: true },
  showRating: { type: Boolean, default: true },
  showCart: { type: Boolean, default: true },
  showWishlist: { type: Boolean, default: true }
});

const emit = defineEmits(['favorite-change']);

const router = useRouter();
const { showToast } = useToast();
const fallbackCover = 'https://source.unsplash.com/collection/1320303/300x450?sig=fallback';

const isBorrowing = ref(false);
const loading = ref(false);
const isInWishlist = ref(false);
const isAlreadyBorrowed = ref(false); // 是否已经借阅过该书

// 余额不足模态框相关
const showBalanceDialog = ref(false);
const showAlreadyBorrowedDialog = ref(false);
const requiredAmount = ref('£0.00');

// 监听登录状态变化
const checkLoginStatus = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    isInWishlist.value = false;
  }
};

// 在组件挂载时添加登录状态监听
onMounted(() => {
  checkLoginStatus();
  checkBorrowStatus(); // 检查借阅状态
  window.addEventListener('storage', (e) => {
    if (e.key === 'token') {
      checkLoginStatus();
      checkBorrowStatus(); // 登录状态改变时也检查借阅状态
    }
  });
});

// 在组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('storage', checkLoginStatus);
});

const isAvailable = computed(() => {
  // 如果已经借阅，则显示不可用
  if (isAlreadyBorrowed.value) return false;
  return true; // 默认视为可用（如果有库存字段可以做判断）
});

// 检查用户是否已借阅该书籍
const checkBorrowStatus = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    isAlreadyBorrowed.value = false;
    return;
  }

  // 检查本地存储中的借阅记录
  try {
    // 首先检查本地存储
    const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
    const borrowed = borrowedBooks.some(item => String(item.bookId) === String(props.book.bookId));

    if (borrowed) {
      isAlreadyBorrowed.value = true;
      return;
    }

    // 如果本地没有记录，则请求API获取借阅列表
    const response = await getBorrowList();
    if (response.state === 'success' && Array.isArray(response.data)) {
      isAlreadyBorrowed.value = response.data.some(
        item => String(item.bookId) === String(props.book.bookId)
      );
    }
  } catch (error) {
    console.error('检查借阅状态失败:', error);
    isAlreadyBorrowed.value = false;
  }
};

// 心愿单相关函数
const toggleWishlist = async (event) => {
  event.stopPropagation();

  const token = localStorage.getItem('token');
  if (!token) {
    showToast('Please login first', 'error');
    return;
  }

  // 检查是否已借阅该书籍
  if (isAlreadyBorrowed.value) {
    showToast('You have already borrowed this book', 'warning');
    return;
  }

  loading.value = true;
  try {
    if (isInWishlist.value) {
      await removeFromWishlist(props.book.bookId);
      isInWishlist.value = false;
      showToast('Removed from wishlist', 'success');
    } else {
      const response = await addToWishlist(props.book.bookId);
      if (response.state === 'success') {
        isInWishlist.value = true;
        showToast('Added to wishlist', 'success');
      } else if (response.state === ' exist.') {
        showToast('This book is already in your wishlist', 'info');
        isInWishlist.value = false; // 保持非激活状态
      } else {
        throw new Error('添加失败');
      }
    }

    // 触发自定义事件，通知Header组件更新心愿单数量
    document.dispatchEvent(new CustomEvent('wishlist-updated'));

    // 通知父组件
    emit('favorite-change', {
      bookId: props.book.bookId,
      isFavorite: isInWishlist.value
    });
  } catch (error) {
    console.error('操作心愿单失败:', error);
    showToast('Operation failed, please try again later', 'error');
  } finally {
    loading.value = false;
  }
};

// 检查心愿单状态
const checkWishlistStatus = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await getWishlist();
    const bookIds = response?.bookId?.map(id => String(id)) || [];
    isInWishlist.value = bookIds.includes(String(props.book.bookId));
  } catch (error) {
    console.error('检查心愿单状态失败:', error);
  }
};

// 跳转到书籍详情
const navigateToDetail = () => {
  try {
    if (props.book?.bookId) {
      const bookCache = {
        bookId: props.book.bookId,
        title: props.book.title,
        author: props.book.author,
        price: props.book.price,
        coverUrl: props.book.cover || props.book.coverUrl
      };
      localStorage.setItem(`book_${props.book.bookId}`, JSON.stringify(bookCache));
    }
    router.push(`/book/${props.book.bookId}`);
  } catch (error) {
    console.error('跳转书籍详情失败:', error);
    showToast('Page navigation failed, please try again later', 'error');
  }
};

// 跳转到我的图书页面
const goToMyBooks = () => {
  router.push('/user/books');
  showAlreadyBorrowedDialog.value = false;
};

// 读取余额
const getBalance = () => Number(localStorage.getItem('accountBalance') || 0);
// 保存余额
const setBalance = (val) => localStorage.setItem('accountBalance', val);

// 跳转到充值页面
const goToTopUp = () => {
  router.push({ path: '/user/profile', query: { view: 'TopUp' } });
  showBalanceDialog.value = false;
};

// 借阅处理
const handleBorrow = async (event) => {
  event.stopPropagation();

  const token = localStorage.getItem('token');
  if (!token) {
    showToast('Please login first', 'error');
    return;
  }

  // 如果已经借阅了，显示对应的提示框
  if (isAlreadyBorrowed.value) {
    showAlreadyBorrowedDialog.value = true;
    return;
  }

  if (isBorrowing.value || !isAvailable.value) return;

  isBorrowing.value = true;
  try {
    const result = await borrowBook(props.book.bookId);

    // 检查是否是余额不足的响应
    if (result?.state === 'insufficient balance' || result?.message?.includes('insufficient balance')) {
      // 更新所需金额并显示模态框
      requiredAmount.value = `£${result.newPayment || '0.00'}`;
      showBalanceDialog.value = true;
      return;
    }

    // 处理其他响应状态
    if (result.state === 'success') {
      saveBorrowedBook(result.dueDate);
      setBalance(result.balance);
      showToast('Borrowed successfully, go to My Books to view', 'success');
      isAlreadyBorrowed.value = true; // 更新借阅状态
    } else if (result.state === 'Reach borrow limit') {
      showToast('Reached borrowing limit', 'error');
    } else if (result.state === 'Borrow failed.') {
      let errorMessage = 'Borrow failed: ';
      if (result.InvalidBookIds?.includes(props.book.bookId)) {
        errorMessage += 'Invalid book';
      } else if (result.LowStockBookIds?.includes(props.book.bookId)) {
        errorMessage += 'Out of stock';
      } else if (result.BorrowedBookIds?.includes(props.book.bookId)) {
        errorMessage += 'You have already borrowed this book';
        isAlreadyBorrowed.value = true; // 更新借阅状态
        showAlreadyBorrowedDialog.value = true; // 显示已借阅提示框
        return;
      }
      showToast(errorMessage, 'error');
    } else {
      showToast(result.message || 'Borrowing failed, please try again later', 'error');
    }
  } catch (error) {
    // 这里只处理真正的异常情况
    showToast('Request exception, please try again later', 'error');
  } finally {
    isBorrowing.value = false;
  }
};

// 保存借阅到本地
const saveBorrowedBook = (dueDate) => {
  const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
  borrowedBooks.push({
    bookId: props.book.bookId,
    title: props.book.title,
    cover: props.book.cover,
    author: props.book.author,
    dueDate: dueDate,
    borrowDate: new Date().toISOString().split('T')[0]
  });
  localStorage.setItem('borrowedBooks', JSON.stringify(borrowedBooks));
};

// 组件挂载时检查心愿单状态
onMounted(() => {
  checkWishlistStatus();
});
</script>

<style scoped>
.book-card {
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.book-cover {
  width: 100%;
  margin-bottom: 15px;
  aspect-ratio: 2/3;
  overflow: hidden;
  border-radius: 5px;
  background-color: #f0f0f0;
  position: relative;
}

.book-card:hover .book-cover img {
  transform: scale(1.05);
}

/* 心愿单按钮容器样式 */
.wishlist-button-container {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

/* 心愿单按钮样式 */
.wishlist-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  color: #888;
  font-size: 18px;
}

.wishlist-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
}

.wishlist-btn.active {
  color: #e74c3c;
}

.wishlist-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.book-title {
  font-size: 16px;
  margin: 0 0 5px;
  font-weight: 600;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 40px;
}

.book-author {
  font-size: 14px;
  color: #666;
  margin: 0 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-price {
  font-size: 15px;
  color: #e74c3c;
  font-weight: 600;
  margin: 0 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-rating {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.stars {
  display: flex;
  color: #ffd700;
}

.rating-count {
  margin-left: 5px;
  font-size: 12px;
  color: #999;
}

.book-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
}

.borrow-btn {
  padding: 8px 0;
  background: #e9a84c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.borrow-btn:hover:not(:disabled) {
  background: #d89638;
  transform: translateY(-2px);
}

.borrow-btn.not-available {
  background: #ccc;
  cursor: not-allowed;
}

.borrow-btn.already-borrowed {
  background: #6c757d;
  cursor: pointer;
}

.borrow-btn.loading {
  background: #f0b561;
}

.loading-icon {
  animation: spin 1s linear infinite;
  margin-right: 5px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.cart-btn-container {
  margin-top: 0;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 25px;
  width: 90%;
  max-width: 400px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-content h3 {
  margin-top: 0;
  font-size: 20px;
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 25px;
  gap: 10px;
}

.cancel-btn, .topup-btn, .view-btn {
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  border: none;
}

.cancel-btn {
  background: #f0f0f0;
  color: #666;
}

.topup-btn {
  background: #4c9fe9;
  color: white;
}

.view-btn {
  background: #28a745;
  color: white;
}

.error-message, .info-message {
  text-align: center;
  padding: 20px 0;
}

.error-icon {
  width: 50px;
  height: 50px;
  background: #fff0f0;
  color: #ff4d4d;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 24px;
}

.info-icon {
  width: 50px;
  height: 50px;
  background: #e1f5fe;
  color: #4c9fe9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 24px;
}
</style>
