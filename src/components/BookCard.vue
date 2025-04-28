<template>
  <div class="book-card" @click="navigateToDetail">
    <div class="book-cover">
      <BookCover :src="book.cover || book.coverUrl || fallbackCover" :alt="book.title" />

    </div>

    <h3 class="book-title">{{ book.title || '未命名书籍' }}</h3>
    <p class="book-author">{{ book.author || '未知作者' }}</p>
    <p class="book-price">£5</p>

    <div class="book-rating" v-if="showRating">
      <div class="stars">
        <i v-for="n in 5" :key="n" :class="['fas', n <= (book.rating || 0) ? 'fa-star' : 'fa-star-o']"></i>
      </div>
      <span class="rating-count">可借</span>
    </div>

    <div class="book-actions">
      <button
        class="borrow-btn"
        :class="{ 'not-available': !isAvailable, 'loading': isBorrowing }"
        :disabled="!isAvailable || isBorrowing"
        @click.stop="handleBorrow"
      >
        <i v-if="isBorrowing" class="ri-loader-4-line loading-icon"></i>
        {{ isAvailable ? (isBorrowing ? '借阅中...' : '借阅') : '暂不可用' }}
      </button>

      <AddToCartButton v-if="showCart" :book-id="book.bookId" @click.stop class="cart-btn-container" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import AddToCartButton from './AddToCartButton.vue';
import BookCover from './BookCover.vue';
import { borrowBook } from '../api/borrowApi.ts';
import { useToast } from '../composables/useToast';

const props = defineProps({
  book: { type: Object, required: true },
  showRating: { type: Boolean, default: true },
  showCart: { type: Boolean, default: true }
});

const emit = defineEmits(['favorite-change']);

const router = useRouter();
const { showToast } = useToast();
const fallbackCover = 'https://source.unsplash.com/collection/1320303/300x450?sig=fallback';

const isBorrowing = ref(false);

const isAvailable = computed(() => {
  return true; // 默认视为可用（如果有库存字段可以做判断）
});

// 处理收藏状态变化
const handleFavoriteChange = (event) => {
  emit('favorite-change', event);
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

  if (isBorrowing.value || !isAvailable.value) return;

  // 检查余额是否足够
  const price = 5; // 固定价格为5英镑
  const balance = getBalance();
  if (balance < price) {
    showToast('余额不足，请先充值', 'error');
    router.push({ name: 'TopUp' });
    return;
  }

  isBorrowing.value = true;
  try {
    const result = await borrowBook(props.book.bookId);

    if (result.state === 'success') {
      saveBorrowedBook(result.dueDate);
      setBalance(balance - price); // 扣除余额并持久化
      showToast('借阅成功，前往我的书籍查看', 'success');
      router.push('/my-books');
    } else if (result.state === 'insufficient balance') {
      router.push({ name: 'TopUp', query: { amount: result.newPayment } });
    } else {
      showToast(result.message || '借阅失败，请稍后重试', 'error');
    }
  } catch (error) {
    handleApiError(error);
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

// 统一处理接口异常
const handleApiError = (error) => {
  if (error.response) {
    showToast(`服务器错误(${error.response.status})`, 'error');
  } else if (error.request) {
    showToast('连接服务器失败，请检查网络', 'error');
  } else {
    showToast('请求异常，请稍后再试', 'error');
  }
};
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
}

.book-card:hover .book-cover img {
  transform: scale(1.05);
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
