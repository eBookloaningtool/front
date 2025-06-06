<template>
  <div class="my-books-page">
    <div class="container">
      <h1 class="page-title">My Books</h1>

      <div class="tabs">
        <button
          :class="['tab-btn', { active: activeTab === 'borrowed' }]"
          @click="activeTab = 'borrowed'"
        >
          Currently Borrowed
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'history' }]"
          @click="activeTab = 'history'"
        >
          Borrowing History
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
            <p class="due-date">Due Date: {{ book.dueDate }}</p>
            <div class="book-actions">
              <button
                class="renew-btn"
                :class="{ 'loading': isRenewing && currentBookId === book.bookId }"
                :disabled="isRenewing && currentBookId === book.bookId"
                @click="openRenewModal(book.bookId)"
              >
                <i v-if="isRenewing && currentBookId === book.bookId" class="ri-loader-4-line loading-icon"></i>
                {{ isRenewing && currentBookId === book.bookId ? 'Renewing...' : 'Renew' }}
              </button>
              <button class="return-btn" @click="openReturnModal(book.bookId)">Return</button>
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
            <p class="borrow-date">Borrow Date: {{ book.borrowDate }}</p>
            <p class="return-date">Return Date: {{ book.returnDate }}</p>
          </div>
        </div>
      </div>

      <div class="empty-state" v-else>
        <img src="../assets/empty-books.svg" alt="No books" />
        <p>You currently have no {{ activeTab === 'borrowed' ? 'borrowed books' : 'borrowing history' }}</p>
        <router-link to="/" class="browse-btn">Browse Books</router-link>
      </div>
    </div>

    <!-- Renewal confirmation modal box -->
    <div class="modal-overlay" v-if="showRenewModal" @click.self="closeRenewModal">
      <div class="modal-content">
        <button class="close-btn" @click="closeRenewModal">&times;</button>

        <div v-if="renewSuccess" class="success-message">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3>Renewal Successful!</h3>
          <p>Borrowing period extended by 30 days</p>
          <p class="balance">Current Balance: £{{ userBalance.toFixed(2) }}</p>
        </div>

        <div v-else>
          <h3>Confirm Renewal</h3>
          <p>Renewing will extend the borrowing period by 30 days</p>
          <p class="fee">Renewal Fee: £{{ renewFee.toFixed(2) }}</p>
          <p class="balance">Current Balance: £{{ userBalance.toFixed(2) }}</p>

          <div v-if="renewError" class="error-message">
            {{ renewError }}
          </div>

          <div class="modal-actions">
            <button class="cancel-btn" @click="closeRenewModal">Cancel</button>
            <button
              v-if="userBalance >= renewFee"
              class="confirm-btn"
              :class="{ 'loading': isRenewing }"
              :disabled="isRenewing"
              @click="handleRenewBook"
            >
              <i v-if="isRenewing" class="ri-loader-4-line loading-icon"></i>
              {{ isRenewing ? 'Renewing...' : 'Confirm Renewal' }}
            </button>
            <button v-else class="topup-btn" @click="goToTopUp">Top Up</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Return confirmation modal -->
    <div class="modal-overlay" v-if="showReturnModal" @click.self="closeReturnModal">
      <div class="modal-content">
        <button class="close-btn" @click="closeReturnModal">&times;</button>

        <div v-if="returnSuccess" class="success-message">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3>Return Successful!</h3>
          <p>Book has been successfully returned</p>
        </div>

        <div v-else>
          <h3>Confirm Return</h3>
          <p>Are you sure you want to return this book?</p>

          <div v-if="returnError" class="error-message">
            {{ returnError }}
          </div>

          <div class="modal-actions">
            <button class="cancel-btn" @click="closeReturnModal">Cancel</button>
            <button
              class="confirm-btn"
              :class="{ 'loading': isReturning }"
              :disabled="isReturning"
              @click="handleReturnBook"
            >
              <i v-if="isReturning" class="ri-loader-4-line loading-icon"></i>
              {{ isReturning ? 'Returning...' : 'Confirm Return' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { renewBook, getBorrowList, returnBook, getBorrowHistory } from '../api/borrowApi';
import { getBookDetail } from '../api/books';
import { getUserInfo } from '../api/user';

const router = useRouter();
const activeTab = ref('borrowed');
const userBalance = ref(0);
const showRenewModal = ref(false);
const showReturnModal = ref(false);
const currentBookId = ref(null);
const renewFee = ref(5); // Renewal fee
const renewError = ref('');
const renewSuccess = ref(false);
const returnError = ref('');
const returnSuccess = ref(false);
const isReturning = ref(false);
const isRenewing = ref(false);

// Borrowed books and history records
const borrowedBooks = ref([]);
const historyBooks = ref([]);

// Watch tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'history') {
    fetchBorrowHistory();
  }
});

// Get borrowed list
const fetchBorrowedBooks = async () => {
  try {
    const response = await getBorrowList();
    if (response.state === 'success' && response.data) {
      // Get detailed information for each book
      const bookDetails = await Promise.all(
        response.data.map(async (borrow) => {
          try {
            const bookDetail = await getBookDetail(borrow.bookId);
            if (bookDetail) {
              return {
                bookId: borrow.bookId,
                title: bookDetail.title,
                author: bookDetail.author,
                cover: bookDetail.coverUrl || bookDetail.cover,
                borrowDate: borrow.borrowDate,
                dueDate: borrow.dueDate
              };
            }
            return null;
          } catch (err) {
            console.error('Failed to get book details:', err);
            return null;
          }
        })
      );

      // Filter out books that failed to retrieve
      borrowedBooks.value = bookDetails.filter(book => book !== null);
    } else {
      borrowedBooks.value = [];
    }
  } catch (error) {
    console.error('Failed to get borrowed books:', error);
    borrowedBooks.value = [];
  }
};

// Get borrowing history
const fetchBorrowHistory = async () => {
  try {
    console.log('Starting to fetch borrowing history data...');

    // Call API to get borrowing history
    const response = await getBorrowHistory();
    console.log('getBorrowHistory API response:', {
      state: response.state,
      dataLength: response.data?.length,
      data: response.data
    });

    if (response.state === 'success' && response.data) {
      console.log('Starting to process borrowing history data, total', response.data.length, 'records');

      // Get detailed information for each book
      const bookDetails = await Promise.all(
        response.data.map(async (borrow, index) => {
          try {
            console.log(`Getting details for book ${index + 1}, bookId:`, borrow.bookId);
            const bookDetail = await getBookDetail(borrow.bookId);
            console.log(`Book ${index + 1} details:`, {
              bookId: borrow.bookId,
              title: bookDetail?.title,
              author: bookDetail?.author,
              cover: bookDetail?.coverUrl || bookDetail?.cover
            });

            if (bookDetail) {
              return {
                bookId: borrow.bookId,
                title: bookDetail.title,
                author: bookDetail.author,
                cover: bookDetail.coverUrl || bookDetail.cover,
                borrowDate: borrow.borrowDate,
                returnDate: borrow.returnDate,
                status: borrow.status
              };
            }
            console.warn(`Failed to get details for book ${index + 1}, bookId:`, borrow.bookId);
            return null;
          } catch (err) {
            console.error(`Error getting details for book ${index + 1}:`, err);
            return null;
          }
        })
      );

      // Filter out books that failed to retrieve
      const validBooks = bookDetails.filter(book => book !== null);
      console.log('Data processing completed:', {
        originalDataCount: response.data.length,
        validDataCount: validBooks.length,
        invalidDataCount: response.data.length - validBooks.length,
        finalData: validBooks
      });

      historyBooks.value = validBooks;
    } else {
      console.warn('API returned status is not success or data is empty:', {
        state: response.state,
        hasData: !!response.data
      });
      historyBooks.value = [];
    }
  } catch (error) {
    console.error('Failed to get borrowing history:', error);
    historyBooks.value = [];
  }
};

// Fetch data when component is mounted
onMounted(async () => {
  fetchBorrowedBooks();
  // If initial tab is history, get history records
  if (activeTab.value === 'history') {
    fetchBorrowHistory();
  }
});

// Navigate to book detail page
const viewBookDetail = (bookId) => {
  router.push(`/book/${bookId}`);
};

// Navigate to author page
const viewAuthorBooks = (author) => {
  router.push({ path: '/search', query: { author } });
};

// Open renewal confirmation window
const openRenewModal = async (bookId) => {
  console.log('Opening renewal confirmation window, bookId:', bookId);
  isRenewing.value = true;
  try {
    currentBookId.value = bookId;
    renewError.value = '';
    renewSuccess.value = false;

    console.log('Starting to get user balance...');
    try {
      const response = await getUserInfo();
      console.log('getUserInfo API response:', response);
      if (response.balance) {
        userBalance.value = response.balance || 0;
        console.log('Updated user balance:', userBalance.value);
      }
    } catch (error) {
      console.error('Failed to get user balance:', error);
    }

    // Get book details to get price
    console.log('Getting book details...');
    const bookDetail = await getBookDetail(bookId);
    console.log('Book details:', bookDetail);

    if (bookDetail) {
      renewFee.value = bookDetail.price;
      console.log('Set renewal fee:', renewFee.value);
    } else {
      console.error('Failed to get book information');
      renewError.value = 'Failed to get book information, please try again later';
      showRenewModal.value = true;
      return;
    }

    // Call renewal API to check status
    console.log('Calling renewal API to check status...');
    const result = await renewBook(bookId);
    console.log('Renewal API response:', result);

    if (result.state === 'success') {
      console.log('Renewal check successful');
      renewSuccess.value = true;
      // Update due date in borrowed list
      const book = borrowedBooks.value.find(b => b.bookId === bookId);
      if (book) {
        book.dueDate = result.newDueDate;
        console.log('Updated due date:', result.newDueDate);
      }
    } else if (result.state === 'insufficient balance') {
      console.log('Insufficient balance:', result.newPayment);
      renewError.value = `Insufficient balance, you need £${result.newPayment}`;
    } else {
      console.error('Renewal failed:', result.message);
      renewError.value = result.message || 'Renewal failed, please try again later';
    }

    showRenewModal.value = true;
  } catch (error) {
    console.error('Failed to check renewal status:', error);
    renewError.value = 'Failed to check renewal status, please try again later';
    showRenewModal.value = true;
  } finally {
    isRenewing.value = false;
  }
};

// Close renewal confirmation window
const closeRenewModal = () => {
  showRenewModal.value = false;
  setTimeout(() => {
    renewSuccess.value = false;
    renewError.value = '';
  }, 300);
};

// Renew book
const handleRenewBook = async () => {
  isRenewing.value = true;
  try {
    const result = await renewBook(currentBookId.value);
    if (result.state === 'success') {
      renewSuccess.value = true;
      // Update due date in borrowed list
      const book = borrowedBooks.value.find(b => b.bookId === currentBookId.value);
      if (book) {
        book.dueDate = result.newDueDate;
      }
      // Auto close window after 3 seconds
      setTimeout(() => {
        closeRenewModal();
      }, 3000);
    } else {
      renewError.value = result.message || 'Renewal failed, please try again later';
    }
  } catch (error) {
    console.error('Renewal failed:', error);
    renewError.value = 'Renewal failed, please try again later';
  } finally {
    isRenewing.value = false;
  }
};

// Navigate to top-up page
const goToTopUp = () => {
  router.push('/user/topup');
  closeRenewModal();
};

// Open return confirmation window
const openReturnModal = (bookId) => {
  currentBookId.value = bookId;
  returnError.value = '';
  returnSuccess.value = false;
  showReturnModal.value = true;
};

// Close return confirmation window
const closeReturnModal = () => {
  showReturnModal.value = false;
  setTimeout(() => {
    returnSuccess.value = false;
    returnError.value = '';
  }, 300);
};

// Return book
const handleReturnBook = async () => {
  isReturning.value = true;
  try {
    const result = await returnBook(currentBookId.value);
    if (result.state === 'success') {
      // Find the current borrowed book
      const bookIndex = borrowedBooks.value.findIndex(b => b.bookId === currentBookId.value);
      if (bookIndex !== -1) {
        // Remove from borrowed list
        borrowedBooks.value.splice(bookIndex, 1);
      }
      // Show success message
      returnSuccess.value = true;
      returnError.value = '';
      // Auto close window after 3 seconds
      setTimeout(() => {
        closeReturnModal();
      }, 3000);
    } else {
      returnError.value = result.message || 'Return failed, please try again later';
    }
  } catch (error) {
    console.error('Return failed:', error);
    returnError.value = 'Return failed, please try again later';
  } finally {
    isReturning.value = false;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.renew-btn {
  background: #e9a84c;
  color: white;
}

.return-btn {
  background: #3498db;
  color: white;
}

.renew-btn.loading, .return-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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

/* Modal styles */
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.confirm-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
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
