<template>
  <div class="book-detail-container">
    <div v-if="isLoading" class="loading">
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="book" class="book-detail">
      <div class="book-main">
        <div class="book-left">
          <div class="book-cover">
            <img :src="book.coverUrl || book.cover" :alt="book.title" @error="handleImageError" />
          </div>
          <div class="book-basic-info">
            <h1 class="book-title">{{ book.title }}</h1>
            <p class="book-author">作者: <a @click="viewAuthorBooks(book.author)">{{ book.author }}</a></p>
            <p class="book-category">分类: <RouterLink :to="`/category/${book.category}`">{{ book.category }}</RouterLink></p>
            <p class="book-price">价格: £{{ book.price }}</p>
            <p class="book-available">
              可借副本:
              <span :class="{'out-of-stock': book.availableCopies <= 0, 'in-stock': book.availableCopies > 0}">
                {{ book.availableCopies }}/{{ book.totalCopies }}
              </span>
            </p>
          </div>
        </div>

        <div class="book-right">
          <div class="book-description">
            <h3>简介</h3>
            <p>{{ book.description || '暂无简介' }}</p>
          </div>

          <div class="book-actions">
            <AddToCartButton :book-id="bookId" />
            <BorrowButton :book="book" @borrow="handleBorrow" :is-borrowing="isBorrowing" />
          </div>

          <div class="book-comments">
            <CommentSection :book-id="bookId" />
          </div>
        </div>
      </div>

      <!-- 余额不足提示框 -->
      <div v-if="showBalanceDialog" class="dialog-overlay">
        <div class="dialog">
          <h3>余额不足</h3>
          <p>您的账户余额不足，需要充值{{ formatPrice(requiredAmount) }}才能借阅此书</p>
          <div class="dialog-actions">
            <button @click="goToTopUp">去充值</button>
            <button @click="showBalanceDialog = false">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AddToCartButton from '../components/AddToCartButton.vue';
import BorrowButton from '../components/BorrowButton.vue';
import CommentSection from '../components/CommentSection.vue';
import { borrowBook } from '@/api/borrowApi';
import { formatPrice } from '@/utils/format';
import { sendEmailNotification } from '@/utils/emailService';

const route = useRoute();
const router = useRouter();
const book = ref(null);
const isLoading = ref(true);
const error = ref(null);
const defaultCover = 'https://source.unsplash.com/collection/1320303/300x450?sig=fallback';
const isBorrowing = ref(false);
const showBalanceDialog = ref(false);
const requiredAmount = ref(0);
const borrowCountCache = ref(0); // 缓存借阅数量

const bookId = computed(() => {
  return route.params.id;
});

onMounted(() => {
  fetchBookDetail();
});

async function fetchBookDetail() {
  isLoading.value = true;
  error.value = null;

  try {
    // 此处使用模拟数据或实际API
    if (window.mockMode) {
      // 模拟数据获取
      setTimeout(() => {
        import('../mock-api.js').then(mockApi => {
          const bookData = mockApi.getMockBook(bookId.value);
          if (bookData) {
            book.value = bookData;
            cacheBookData(bookData);
          } else {
            error.value = '未找到书籍';
          }
          isLoading.value = false;
        });
      }, 500);
    } else {
      // 实际API调用
      const response = await fetch(`https://api.borrowbee.wcy.one:61700/api/books/get?bookId=${bookId.value}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`获取书籍详情失败: ${response.status} ${response.statusText}`);
      }

      // 检查响应类型
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('服务器返回了非JSON响应');
      }

      const bookData = await response.json();
      
      // 验证返回的数据结构
      if (!bookData || typeof bookData !== 'object') {
        throw new Error('返回的数据格式不正确');
      }

      book.value = bookData;
      cacheBookData(bookData);
      isLoading.value = false;
    }
  } catch (err) {
    console.error('获取书籍详情错误:', err);
    error.value = `无法加载书籍详情: ${err.message}`;
    isLoading.value = false;
  }
}

// 缓存书籍数据到localStorage
function cacheBookData(bookData) {
  try {
    if (!bookData) {
      console.error('缓存书籍数据失败: 书籍数据为空');
      return;
    }

    // 确保bookId存在，可能来自bookId或id字段
    const bookId = bookData.bookId || bookData.id || route.params.id;

    if (!bookId) {
      console.error('缓存书籍数据失败: 无法确定书籍ID', bookData);
      return;
    }

    // 确保所有必要字段存在
    const bookCache = {
      bookId: bookId, // 确保这里一定有bookId
      id: bookId,     // 同时存储id，以适应不同组件的需求
      title: bookData.title || '未知书籍',
      author: bookData.author || '未知作者',
      price: bookData.price || 0,
      coverUrl: bookData.coverUrl || bookData.cover || defaultCover
    };

    // 存储到localStorage
    const cacheKey = `book_${bookId}`;
    localStorage.setItem(cacheKey, JSON.stringify(bookCache));
    console.log('已缓存书籍数据:', bookId, bookCache);

    // 同步更新本地购物车中可能存在的相同书籍数据
    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      let updated = false;

      // 更新购物车中相同ID的书籍信息
      for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].bookId === bookId || cartItems[i].id === bookId) {
          cartItems[i] = { ...cartItems[i], ...bookCache };
          updated = true;
        }
      }

      // 如果有更新，保存回localStorage
      if (updated) {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        console.log('已更新购物车中的书籍信息:', bookId);
      }
    } catch (cartError) {
      console.error('更新购物车中的书籍信息失败:', cartError);
    }
  } catch (error) {
    console.error('缓存书籍数据到localStorage失败:', error);
  }
}

function handleWishlistUpdate(data) {
  console.log('愿望清单状态更新:', data);
}

function handleImageError(event) {
  event.target.src = defaultCover;
}

// 添加返回功能
function goBack() {
  router.back();
}

// 添加导航到作者页面功能
function viewAuthorBooks(author) {
  router.push({ path: '/search', query: { author } });
}

// 添加导航到分类页面功能
function viewCategory(category) {
  router.push({ path: '/category/' + category });
}

const handleBorrow = async () => {
  isBorrowing.value = true;
  try {
    const result = await borrowBook(bookId.value);
    if (result.state === 'success') {
      // 借阅成功，更新借阅计数缓存
      borrowCountCache.value = Math.min(10, (borrowCountCache.value || 0) + 1);

      // 借阅成功，保存借阅信息到localStorage
      const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
      borrowedBooks.push({
        bookId: bookId.value,
        title: book.value.title,
        cover: book.value.coverUrl || book.value.cover,
        author: book.value.author,
        dueDate: result.dueDate, // 服务器返回的到期日期（30天后）
        borrowDate: new Date().toISOString().split('T')[0] // 当前日期
      });
      localStorage.setItem('borrowedBooks', JSON.stringify(borrowedBooks));

      // 发送借阅成功邮件
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      sendEmailNotification('borrow', {
        user: user,
        book: book.value,
        borrowDate: new Date().toISOString().split('T')[0],
        dueDate: result.dueDate
      }).catch(err => console.error('发送借阅邮件失败:', err));

      // 显示成功提示并跳转到阅读器页面
      alert('借阅成功！正在打开阅读器...');
      router.push({
        name: 'Reader',
        params: { id: bookId.value }
      });
    } else if (result.state === 'insufficient balance') {
      // 余额不足，直接跳转到充值页面
      requiredAmount.value = result.newPayment;
      alert(`您的账户余额不足，需要充值${formatPrice(result.newPayment)}才能借阅此书。正在跳转到充值页面...`);
      router.push({
        name: 'TopUp'
      });
    } else if (result.state === 'exceed_limit') {
      // 书籍借阅次数已达上限（全局限制）
      alert('该书籍已达到最大借阅次数限制（10次），暂不可借阅。');
    } else if (result.state === 'Reach borrow limit') {
      // 用户借阅书籍数量已达上限（用户限制）
      alert('您已达到最大借阅数量限制（10本），请归还部分书籍后再试。');
    } else if (result.state === 'Borrow failed.') {
      // 处理借阅失败情况，可能是无效书籍ID、库存不足或已借阅
      if (result.InvalidBookIds?.length) {
        alert('借阅失败：无效的书籍');
      } else if (result.LowStockBookIds?.length) {
        alert('借阅失败：库存不足');
      } else if (result.BorrowedBookIds?.length) {
        alert('借阅失败：您已借阅过该书籍');
      } else {
        alert('借阅失败，请稍后重试');
      }
    } else {
      // 其他错误状态
      alert(`借阅失败: ${result.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('借阅书籍出错:', error);
    // 检查是否是网络错误或服务器错误
    if (error.response) {
      // 服务器返回了错误状态码
      alert(`借阅请求失败: 服务器返回 ${error.response.status} 错误`);
    } else if (error.request) {
      // 请求发出但没有收到响应
      alert('借阅请求失败: 无法连接到服务器，请检查网络连接');
    } else {
      // 其他错误
      alert('借阅请求出错，请稍后重试');
    }
  } finally {
    isBorrowing.value = false;
  }
};

const goToTopUp = () => {
  router.push({ name: 'TopUpPage' });
  showBalanceDialog.value = false;
};

// 获取当前书籍已借阅数量
const getBorrowCount = () => {
  // 优先使用缓存的值
  if (borrowCountCache.value > 0) {
    return borrowCountCache.value;
  }

  // 在真实环境中，这个数据应该从API获取
  // 这里从mockData获取或使用默认值
  if (window.mockData && window.mockData.bookBorrowCount && window.mockData.bookBorrowCount[bookId.value]) {
    borrowCountCache.value = window.mockData.bookBorrowCount[bookId.value];
    return borrowCountCache.value;
  }

  // 如果没有数据，根据availableCopies和totalCopies计算
  if (book.value && book.value.availableCopies !== undefined && book.value.totalCopies !== undefined) {
    borrowCountCache.value = book.value.totalCopies - book.value.availableCopies;
    return borrowCountCache.value;
  }

  return 0; // 默认值
};
</script>

<style scoped>
.book-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  margin-top: 80px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
}

.book-detail {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.book-main {
  display: flex;
  gap: 50px;
}

.book-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  max-width: 300px;
}

.book-cover {
  width: 100%;
}

.book-cover img {
  width: 100%;
  max-height: 450px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.book-basic-info {
  width: 100%;
}

.book-title {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.book-author, .book-category, .book-price, .book-available {
  margin-bottom: 8px;
  color: #555;
  font-size: 14px;
}

.book-price {
  font-size: 18px;
  color: #e74c3c;
  font-weight: bold;
}

.book-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-left: 20px;
}

.book-description {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.book-description h3 {
  margin-bottom: 10px;
  color: #333;
}

.book-description p {
  font-weight: 300;
  line-height: 1.6;
  color: #666;
}

.book-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.book-comments {
  margin-top: 20px;
  width: 100%;
}

@media (max-width: 768px) {
  .book-main {
    flex-direction: column;
  }

  .book-left {
    max-width: 100%;
  }

  .book-actions {
    flex-direction: column;
    gap: 10px;
  }
}

.in-stock {
  color: #27ae60;
  font-weight: bold;
}

.out-of-stock {
  color: #e74c3c;
  font-weight: bold;
}
</style>
