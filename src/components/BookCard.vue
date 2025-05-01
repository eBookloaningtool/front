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
        :class="{ 'not-available': !isAvailable, 'loading': isBorrowing }"
        :disabled="!isAvailable || isBorrowing"
        @click.stop="handleBorrow"
      >
        <i v-if="isBorrowing" class="ri-loader-4-line loading-icon"></i>
        {{ isAvailable ? (isBorrowing ? 'Borrowing...' : 'Borrow') : 'Not Available' }}
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
  window.addEventListener('storage', (e) => {
    if (e.key === 'token') {
      checkLoginStatus();
    }
  });
});

// 在组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('storage', checkLoginStatus);
});

const isAvailable = computed(() => {
  return true; // 默认视为可用（如果有库存字段可以做判断）
});

// 心愿单相关函数
const toggleWishlist = async (event) => {
  event.stopPropagation();
  if (loading.value) return;

  const token = localStorage.getItem('token');
  if (!token) {
    showToast('Please login first', 'error');
    return;
  }

  loading.value = true;
  try {
    // 如果是要添加到心愿单，先检查是否已借阅
    if (!isInWishlist.value) {
      const isBookBorrowed = await checkIfBookBorrowed();
      if (isBookBorrowed) {
        // 已借阅，显示特定提示并提供跳转链接
        showToast('Already borrowed. View in My Books.', 'info');
        loading.value = false;

        // 添加点击处理，1.5秒后自动跳转到我的书籍页面
        setTimeout(() => {
          router.push('/user/books');
        }, 1500);
        return;
      }
    }

    // 正常的心愿单添加/删除逻辑
    if (isInWishlist.value) {
      await removeFromWishlist(props.book.bookId);
      isInWishlist.value = false;
      showToast('Removed from wishlist', 'success');
    } else {
      const response = await addToWishlist(props.book.bookId);
      if (response.state === 'success') {
        isInWishlist.value = true;
        showToast('Added to wishlist', 'success');
      } else if (response.state === 'Book already exist.') {
        showToast('This book is already in your wishlist', 'info');
        isInWishlist.value = false; // 保持非激活状态
      } else {
        throw new Error('添加失败');
      }
    }

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

// 检查书籍是否已被借阅
const checkIfBookBorrowed = async () => {
  try {
    const response = await getBorrowList();
    if (response.state === 'success' && response.data) {
      // 检查当前书籍ID是否在借阅列表中，且状态为"借阅中"（未归还）
      return response.data.some(item => {
        // 当书籍ID匹配且未归还时，视为已借阅
        return String(item.bookId) === String(props.book.bookId) &&
               (!item.returnDate || item.status === 'borrowed' || item.status === 'active');
      });
    }
    return false;
  } catch (error) {
    console.error('检查借阅状态失败:', error);
    return false;
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
    showToast('页面跳转失败，请稍后重试', 'error');
  }
};

// 读取余额
const getBalance = () => Number(localStorage.getItem('accountBalance') || 0);
// 保存余额
const setBalance = (val) => localStorage.setItem('accountBalance', val);

// 借阅处理
const handleBorrow = async (event) => {
  event.stopPropagation();

  const token = localStorage.getItem('token');
  if (!token) {
    showToast('Please login first', 'error');
    return;
  }

  if (isBorrowing.value || !isAvailable.value) return;

  isBorrowing.value = true;
  try {
    const result = await borrowBook(props.book.bookId);

    // 检查是否是余额不足的响应
    if (result?.state === 'insufficient balance' || result?.message?.includes('insufficient balance')) {
      showToast('Insufficient balance, please recharge first', 'error');
      // 跳转到充值页面
      router.push('/user/profile?view=TopUp');
      return;
    }

    // 处理其他响应状态
    if (result.state === 'success') {
      saveBorrowedBook(result.dueDate);
      setBalance(result.balance);
      showToast('Borrowed successfully, go to My Books to view', 'success');
    } else if (result.state === 'Reach borrow limit') {
      showToast('Reached borrowing limit', 'error');
    } else if (result.state === 'Borrow failed.') {
      let errorMessage = 'Borrow failed: ';
      if (result.InvalidBookIds?.includes(props.book.bookId)) {
        errorMessage += 'Invalid book';
      } else if (result.LowStockBookIds?.includes(props.book.bookId)) {
        errorMessage += 'Out of stock';
      } else if (result.BorrowedBookIds?.includes(props.book.bookId)) {
        errorMessage += 'Already borrowed';
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
</style>
