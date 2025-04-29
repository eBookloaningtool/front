<template>
  <div class="my-books-page">
    <div class="container">
      <h1 class="page-title">我的书籍</h1>
      
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'borrowed' }]" 
          @click="activeTab = 'borrowed'"
        >
          已借阅
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'history' }]" 
          @click="activeTab = 'history'"
        >
          借阅历史
        </button>
      </div>
      
      <div class="books-container" v-if="activeTab === 'borrowed' && borrowedBooks.length > 0">
        <div class="book-item" v-for="book in borrowedBooks" :key="book.bookId">
          <div class="book-cover" @click="viewBookDetail(book.bookId)">
            <img :src="book.cover" :alt="book.title" />
          </div>
          <div class="book-info">
            <h3 @click="viewBookDetail(book.bookId)" style="cursor: pointer;">{{ book.title }}</h3>
            <p class="author" @click="viewAuthorBooks(book.author)" style="cursor: pointer;">{{ book.author }}</p>
            <p class="due-date">到期时间: {{ book.dueDate }}</p>
            <div class="book-actions">
              <button class="renew-btn" @click="openRenewModal(book.bookId)">续借</button>
              <button class="return-btn" @click="openReturnModal(book.bookId)">归还</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="books-container" v-else-if="activeTab === 'history' && historyBooks.length > 0">
        <div class="book-item" v-for="book in historyBooks" :key="book.bookId">
          <div class="book-cover" @click="viewBookDetail(book.bookId)">
            <img :src="book.cover" :alt="book.title" />
          </div>
          <div class="book-info">
            <h3 @click="viewBookDetail(book.bookId)" style="cursor: pointer;">{{ book.title }}</h3>
            <p class="author" @click="viewAuthorBooks(book.author)" style="cursor: pointer;">{{ book.author }}</p>
            <p class="borrow-date">借阅时间: {{ book.borrowDate }}</p>
            <p class="return-date">归还时间: {{ book.returnDate }}</p>
          </div>
        </div>
      </div>
      
      <div class="empty-state" v-else>
        <img src="../assets/empty-books.svg" alt="没有书籍" />
        <p>您当前没有{{ activeTab === 'borrowed' ? '借阅' : '借阅历史' }}记录</p>
        <router-link to="/" class="browse-btn">浏览书籍</router-link>
      </div>
    </div>
    
    <!-- 续借确认模态框 -->
    <div class="modal-overlay" v-if="showRenewModal" @click.self="closeRenewModal">
      <div class="modal-content">
        <button class="close-btn" @click="closeRenewModal">&times;</button>
        
        <div v-if="renewSuccess" class="success-message">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3>续借成功!</h3>
          <p>借阅时间已延长30天</p>
          <p class="balance">当前余额: ￡{{ userBalance.toFixed(2) }}</p>
        </div>
        
        <div v-else>
          <h3>确认续借</h3>
          <p>续借将延长借阅时间30天</p>
          <p class="fee">续借费用: ￡{{ renewFee.toFixed(2) }}</p>
          <p class="balance">当前余额: ￡{{ userBalance.toFixed(2) }}</p>
          
          <div v-if="renewError" class="error-message">
            {{ renewError }}
          </div>
          
          <div class="modal-actions">
            <button class="cancel-btn" @click="closeRenewModal">取消</button>
            <button v-if="userBalance >= renewFee" class="confirm-btn" @click="handleRenewBook">确认续借</button>
            <button v-else class="topup-btn" @click="goToTopUp">充值</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 归还确认模态框 -->
    <div class="modal-overlay" v-if="showReturnModal" @click.self="closeReturnModal">
      <div class="modal-content">
        <button class="close-btn" @click="closeReturnModal">&times;</button>
        
        <div v-if="returnSuccess" class="success-message">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3>归还成功!</h3>
          <p>书籍已成功归还</p>
        </div>
        
        <div v-else>
          <h3>确认归还</h3>
          <p>您确定要归还这本书吗？</p>
          
          <div v-if="returnError" class="error-message">
            {{ returnError }}
          </div>
          
          <div class="modal-actions">
            <button class="cancel-btn" @click="closeReturnModal">取消</button>
            <button class="confirm-btn" @click="handleReturnBook">确认归还</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { renewBook, getBorrowList, returnBook } from '../api/borrowApi';
import { sendEmailNotification } from '../utils/emailService';

const router = useRouter();
const activeTab = ref('borrowed');
const userBalance = ref(0);
const showRenewModal = ref(false);
const showReturnModal = ref(false);
const currentBookId = ref(null);
const renewFee = 5; // 续借费用
const renewError = ref('');
const renewSuccess = ref(false);
const returnError = ref('');
const returnSuccess = ref(false);

// 借阅的书籍和历史记录
const borrowedBooks = ref([]);
const historyBooks = ref([]);

// 获取用户余额
const fetchUserBalance = async () => {
  try {
    // 从localStorage中获取余额，实际应用中应该从API获取
    const balanceStr = localStorage.getItem('userBalance');
    userBalance.value = balanceStr ? parseFloat(balanceStr) : 0;
    
    // 也可以直接从localStorage获取之前在ProfilePage设置的余额
    if (!balanceStr && localStorage.getItem('token')) {
      const defaultBalance = 1250.00; // 使用默认余额
      userBalance.value = defaultBalance;
      localStorage.setItem('userBalance', defaultBalance.toString());
    }
  } catch (error) {
    console.error('获取用户余额失败:', error);
  }
};

// 获取借阅列表
const fetchBorrowedBooks = async () => {
  try {
    // 从localStorage获取借阅数据
    const borrowedBooksData = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
    borrowedBooks.value = borrowedBooksData;
    
    // 这里可以添加API调用获取真实数据
    // const bookIds = await getBorrowList();
    // 然后根据bookIds获取详细信息
  } catch (error) {
    console.error('获取借阅书籍失败:', error);
  }
};

// 获取借阅历史
const fetchBorrowHistory = async () => {
  try {
    // 从localStorage获取历史数据
    const historyBooksData = JSON.parse(localStorage.getItem('borrowHistory') || '[]');
    historyBooks.value = historyBooksData;
    
    // 这里可以添加API调用获取真实数据
  } catch (error) {
    console.error('获取借阅历史失败:', error);
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchUserBalance();
  fetchBorrowedBooks();
  fetchBorrowHistory();
});

// 跳转到书籍详情页
const viewBookDetail = (bookId) => {
  router.push(`/book/${bookId}`);
};

// 跳转到作者页面
const viewAuthorBooks = (author) => {
  router.push({ path: '/search', query: { author } });
};

// 打开续借确认窗口
const openRenewModal = (bookId) => {
  currentBookId.value = bookId;
  renewError.value = '';
  renewSuccess.value = false;
  showRenewModal.value = true;
};

// 关闭续借确认窗口
const closeRenewModal = () => {
  showRenewModal.value = false;
  setTimeout(() => {
    renewSuccess.value = false;
    renewError.value = '';
  }, 300);
};

// 续借书籍
const handleRenewBook = async () => {
  try {
    // 检查用户余额是否足够
    if (userBalance.value < renewFee) {
      renewError.value = '余额不足，请充值';
      return;
    }
    
    // 调用续借API
    const result = await renewBook(currentBookId.value);
    
    if (result.state === 'success') {
      // 更新借阅列表中的到期日期
      const book = borrowedBooks.value.find(b => b.bookId === currentBookId.value);
      if (book) {
        book.dueDate = result.newDueDate;
        // 更新localStorage
        localStorage.setItem('borrowedBooks', JSON.stringify(borrowedBooks.value));
        
        // 发送续借成功邮件
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        sendEmailNotification('borrow', {
          user: user,
          book: book,
          borrowDate: book.borrowDate,
          dueDate: result.newDueDate
        }).catch(err => console.error('发送续借邮件失败:', err));
      }
      
      // 扣除余额
      userBalance.value -= renewFee;
      // 更新localStorage中的余额
      localStorage.setItem('userBalance', userBalance.value.toString());
      
      // 显示成功信息
      renewSuccess.value = true;
      renewError.value = '';
      
      // 3秒后自动关闭窗口
      setTimeout(() => {
        closeRenewModal();
      }, 3000);
    } else if (result.state === 'insufficient balance') {
      renewError.value = `余额不足，需要 ${result.newPayment} 元`;
    } else {
      renewError.value = result.message || '续借失败，请稍后重试';
    }
  } catch (error) {
    console.error('续借失败:', error);
    renewError.value = '续借失败，请稍后重试';
  }
};

// 跳转到充值页面
const goToTopUp = () => {
  router.push('/user/topup');
  closeRenewModal();
};

// 打开归还确认窗口
const openReturnModal = (bookId) => {
  currentBookId.value = bookId;
  returnError.value = '';
  returnSuccess.value = false;
  showReturnModal.value = true;
};

// 关闭归还确认窗口
const closeReturnModal = () => {
  showReturnModal.value = false;
  setTimeout(() => {
    returnSuccess.value = false;
    returnError.value = '';
  }, 300);
};

// 归还书籍
const handleReturnBook = async () => {
  try {
    // 调用归还API
    const result = await returnBook(currentBookId.value);
    
    if (result.state === 'success') {
      // 更新mockData中的借阅计数
      if (window.mockData && window.mockData.bookBorrowCount && window.mockData.bookBorrowCount[currentBookId.value]) {
        window.mockData.bookBorrowCount[currentBookId.value] = Math.max(0, window.mockData.bookBorrowCount[currentBookId.value] - 1);
      }
      
      // 找到当前借阅的书籍
      const bookIndex = borrowedBooks.value.findIndex(b => b.bookId === currentBookId.value);
      
      if (bookIndex !== -1) {
        const book = borrowedBooks.value[bookIndex];
        const returnDate = new Date().toISOString().split('T')[0];
        
        // 将书籍添加到借阅历史
        const historyBook = {
          ...book,
          returnDate: returnDate // 当前日期作为归还日期
        };
        
        historyBooks.value.push(historyBook);
        localStorage.setItem('borrowHistory', JSON.stringify(historyBooks.value));
        
        // 从借阅列表中移除
        borrowedBooks.value.splice(bookIndex, 1);
        localStorage.setItem('borrowedBooks', JSON.stringify(borrowedBooks.value));
        
        // 发送归还确认邮件
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        sendEmailNotification('return', {
          user: user,
          book: book,
          borrowDate: book.borrowDate,
          returnDate: returnDate
        }).catch(err => console.error('发送归还邮件失败:', err));
      }
      
      // 显示成功信息
      returnSuccess.value = true;
      returnError.value = '';
      
      // 3秒后自动关闭窗口
      setTimeout(() => {
        closeReturnModal();
      }, 3000);
    } else {
      returnError.value = result.message || '归还失败，请稍后重试';
    }
  } catch (error) {
    console.error('归还失败:', error);
    returnError.value = '归还失败，请稍后重试';
  }
};
</script>

<style scoped>
.my-books-page {
  padding: 80px 0;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
}

.tabs {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  padding: 12px 20px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  position: relative;
}

.tab-btn.active {
  color: #e9a84c;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 3px;
  background: #e9a84c;
}

.books-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.book-item {
  display: flex;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.book-cover {
  width: 100px;
  min-width: 100px;
  background: #f5f5f5;
}

.book-cover img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.book-info {
  padding: 15px;
  flex-grow: 1;
}

.book-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.author {
  color: #666;
  margin-bottom: 10px;
}

.due-date, .borrow-date, .return-date {
  font-size: 14px;
  color: #888;
  margin-bottom: 5px;
}

.due-date {
  color: #e9a84c;
  font-weight: 500;
}

.book-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.renew-btn, .return-btn {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.renew-btn {
  background: #e9a84c;
  color: white;
}

.return-btn {
  background: #3498db;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 50px 0;
}

.empty-state img {
  width: 120px;
  margin: 0 auto 20px;
}

.empty-state p {
  color: #666;
  margin-bottom: 20px;
}

.browse-btn {
  display: inline-block;
  background: #e9a84c;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
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
  z-index: 1000;
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

.fee, .balance {
  font-size: 16px;
  margin: 15px 0;
}

.fee {
  color: #e9a84c;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 25px;
  gap: 10px;
}

.cancel-btn, .confirm-btn, .topup-btn {
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

.confirm-btn {
  background: #e9a84c;
  color: white;
}

.topup-btn {
  background: #4c9fe9;
  color: white;
}

.error-message {
  background: #fff0f0;
  border-left: 3px solid #ff4d4d;
  padding: 10px 15px;
  color: #ff4d4d;
  margin: 15px 0;
}

.success-message {
  text-align: center;
  padding: 20px 0;
}

.success-icon {
  width: 50px;
  height: 50px;
  background: #e6f7e6;
  color: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
}

.success-message h3 {
  color: #4caf50;
  margin-bottom: 10px;
}

@media (max-width: 600px) {
  .books-container {
    grid-template-columns: 1fr;
  }
}
</style> 