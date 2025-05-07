<template>
  <div class="book-detail-container">
    <div v-if="isLoading" class="loading">
      <p>Loading...</p>
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
            <p class="book-author">Author: <a @click="viewAuthorBooks(book.author)">{{ book.author }}</a></p>
            <p class="book-category">Category: {{ book.category }}</p>
            <p class="book-price">Price: £{{ book.price }}</p>
            <div class="book-rating">
              <div class="stars">
                <i v-for="n in 5"
                   :key="n"
                   :class="['ri-star-' + (n <= (book.rating || 0) ? 'fill' : 'line')]">
                </i>
              </div>
              <span class="rating-value">{{ Number.isInteger(book.rating) ? (book.rating || 0) + '.0' : (book.rating || 0) }}</span>
            </div>
            <p class="book-available">
              Available copies:
              <span :class="{'out-of-stock': book.availableCopies <= 0, 'in-stock': book.availableCopies > 0}">
                {{ book.availableCopies }}/{{ book.totalCopies }}
              </span>
            </p>
          </div>
        </div>

        <div class="book-right">
          <div class="book-description">
            <h3>Description</h3>
            <p>{{ book.description || 'No description available' }}</p>
          </div>

          <div class="book-actions">
            <AddToCartButton :book-id="bookId" buttonText="Add to cart" class="action-button" />
            <BorrowButton :book="book" @borrow="handleBorrow" @login-required="handleLoginRequired" :is-borrowing="isBorrowing" class="action-button" />
            <button @click="readBook" class="action-button" style="background-color: #3498db; color: white; border: none;">
              Read
            </button>
          </div>

          <div class="book-comments">
            <CommentSection :book-id="bookId" />
          </div>
        </div>
      </div>

      <!-- Balance Insufficient Dialog -->
      <div v-if="showBalanceDialog" class="modal-overlay">
        <div class="modal-content">
          <button class="close-btn" @click="showBalanceDialog = false">&times;</button>
          <div class="error-message">
            <div class="error-icon">
              <i class="ri-error-warning-line"></i>
            </div>
            <h3>Insufficient Balance</h3>
            <p>Your account balance is insufficient. You need to top up {{ formatPrice(requiredAmount) }} to borrow this book</p>
            <div class="modal-actions">
              <button class="cancel-btn" @click="showBalanceDialog = false">Cancel</button>
              <button class="topup-btn" @click="goToTopUp">Top up</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Borrow Success Dialog -->
      <div v-if="showBorrowSuccess" class="modal-overlay">
        <div class="modal-content">
          <button class="close-btn" @click="closeBorrowSuccessModal">&times;</button>
          <div class="success-message">
            <div class="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3>Borrow Successful!</h3>
            <p>Book has been successfully borrowed</p>
          </div>
        </div>
      </div>

      <!-- Need To Borrow First Dialog -->
      <div v-if="showNeedBorrowMessage" class="modal-overlay">
        <div class="modal-content">
          <button class="close-btn" @click="closeNeedBorrowModal">&times;</button>
          <div class="error-message">
            <div class="error-icon">
              <i class="ri-information-line"></i>
            </div>
            <h3>Borrow Required</h3>
            <p>You need to borrow this book first before reading it</p>
          </div>
        </div>
      </div>

      <!-- Login Required Dialog -->
      <div v-if="showLoginMessage" class="modal-overlay">
        <div class="modal-content login-modal-content">
          <button class="close-btn" @click="closeLoginModal">&times;</button>
          <div class="login-required">
            <div class="user-icon">
              <i class="ri-user-line"></i>
            </div>
            <h3>Login Required</h3>
            <p>Please login to {{ loginAction }} the book</p>
            <div class="login-modal-actions">
              <button class="cancel-btn" @click="closeLoginModal">Cancel</button>
              <button class="login-btn" @click="goToLogin">Login</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message Dialog -->
      <div v-if="showErrorModal" class="modal-overlay">
        <div class="modal-content">
          <button class="close-btn" @click="closeErrorModal">&times;</button>
          <div class="error-message">
            <div class="error-icon">
              <i class="ri-error-warning-line"></i>
            </div>
            <h3>Error</h3>
            <p>{{ errorMessage }}</p>
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
import axios from 'axios';
import CommentSection from '../components/CommentSection.vue';
import { borrowBook, getBorrowList } from '@/api/borrowApi';
import { formatPrice } from '@/utils/format';
import { useUserStore } from '@/stores/userStore';
import { removeFromWishlist } from '@/api/booksApi';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const book = ref(null);
const isLoading = ref(true);
const error = ref(null);
const defaultCover = 'https://source.unsplash.com/collection/1320303/300x450?sig=fallback';
const isBorrowing = ref(false);
const showBalanceDialog = ref(false);
const requiredAmount = ref(0);
const borrowCountCache = ref(0); // Cache borrow count

// Modal control variables
const showBorrowSuccess = ref(false);
const showNeedBorrowMessage = ref(false);
const showLoginMessage = ref(false);
const loginAction = ref('');

// Display error message modal
const errorMessage = ref('');
const showErrorModal = ref(false);

onMounted(() => {
  fetchBookDetail();
});

async function fetchBookDetail() {
  isLoading.value = true;
  error.value = null;

  try {
    console.log('Starting to fetch book details, bookId:', bookId.value);
    const response = await axios.get(`/api/books/get?bookId=${bookId.value}`);
    console.log('Book details response:', response);

    if (response.data) {
      book.value = response.data;
      console.log('Book details data:', book.value);
      cacheBookData(response.data);
    } else {
      // Actual API call
      const response = await fetch(`https://api.borrowbee.wcy.one:61700/api/books/get?bookId=${bookId.value}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get book details: ${response.status} ${response.statusText}`);
      }


      // Check response type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned a non-JSON response');
      }

      const bookData = await response.json();

      // Validate returned data structure
      if (!bookData || typeof bookData !== 'object') {
        throw new Error('Returned data format is incorrect');
      }

      book.value = bookData;
      cacheBookData(bookData);
    }
    isLoading.value = false;
  } catch (err) {
    console.error('Error fetching book details:', err);
    error.value = `Unable to load book details: ${err.message}`;
    isLoading.value = false;
  }
}

// Cache book data to localStorage
function cacheBookData(bookData) {
  try {
    if (!bookData) {
      console.error('Failed to cache book data: Book data is empty');
      return;
    }

    // Ensure bookId exists, possibly from bookId or id field
    const bookId = bookData.bookId || bookData.id || route.params.id;

    if (!bookId) {
      console.error('Failed to cache book data: Unable to determine book ID', bookData);
      return;
    }

    // Ensure all necessary fields exist
    const bookCache = {
      bookId: bookId, // Ensure bookId is always present
      id: bookId,     // Store id for potential use in different components
      title: bookData.title || 'Unknown book',
      author: bookData.author || 'Unknown author',
      price: bookData.price || 0,
      coverUrl: bookData.coverUrl || bookData.cover || defaultCover
    };

    // Store to localStorage
    const cacheKey = `book_${bookId}`;
    localStorage.setItem(cacheKey, JSON.stringify(bookCache));
    console.log('Book data cached:', bookId, bookCache);

    // Sync update of book information in localStorage for any existing cart items
    try {
      const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      let updated = false;

      // Update cart items with new book information
      for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].bookId === bookId || cartItems[i].id === bookId) {
          cartItems[i] = { ...cartItems[i], ...bookCache };
          updated = true;
        }
      }

      // If there was an update, save back to localStorage
      if (updated) {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        console.log('Updated book information in cart:', bookId);
      }
    } catch (cartError) {
      console.error('Failed to update book information in cart:', cartError);
    }
  } catch (error) {
    console.error('Failed to cache book data to localStorage:', error);
  }
}

function handleWishlistUpdate(data) {
  console.log('Wishlist status updated:', data);
}

function handleImageError(event) {
  event.target.src = defaultCover;
}

// Add back functionality
function goBack() {
  router.back();
}

// Add navigation to author page functionality
function viewAuthorBooks(author) {
  router.push({ path: '/search', query: { author } });
}

const handleBorrow = async () => {
  isBorrowing.value = true;
  try {
    // Check if user is logged in
    if (!userStore.isAuthenticated) {
      loginAction.value = 'borrow';
      showLoginMessage.value = true;
      isBorrowing.value = false;
      return;
    }

    const result = await borrowBook(bookId.value);
    if (result.state === 'success') {
      // Borrow successful, update borrow count cache
      borrowCountCache.value = Math.min(10, (borrowCountCache.value || 0) + 1);

      // Borrow successful, save borrow information to localStorage
      const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
      borrowedBooks.push({
        bookId: bookId.value,
        title: book.value.title,
        cover: book.value.coverUrl || book.value.cover,
        author: book.value.author,
        dueDate: result.dueDate, // Server returned due date (30 days from now)
        borrowDate: new Date().toISOString().split('T')[0] // Current date
      });
      localStorage.setItem('borrowedBooks', JSON.stringify(borrowedBooks));

      // Remove current book from wishlist
      try {
        await removeFromWishlist(bookId.value);
        console.log('Removed from wishlist:', bookId.value);
      } catch (wishlistError) {
        console.error('Failed to remove from wishlist:', wishlistError);
      } finally {
        // Trigger wishlist-updated event to update wishlist count
        document.dispatchEvent(new CustomEvent('wishlist-updated'));
      }

      // Show success notification
      showBorrowSuccess.value = true;
      // Close window after 3 seconds
      setTimeout(() => {
        showBorrowSuccess.value = false;
      }, 3000);
    } else if (result.state === 'insufficient balance') {
      // Insufficient balance, show top-up dialog
      requiredAmount.value = result.newPayment;
      showBalanceDialog.value = true;
    } else if (result.state === 'exceed_limit') {
      // Book borrow count has reached the maximum (global limit)
      showErrorMessage('This book has reached the maximum borrow limit (10 times). Not available for borrowing.');
    } else if (result.state === 'Reach borrow limit') {
      // User has reached the maximum borrow limit (user limit)
      showErrorMessage('You have reached the maximum borrow limit (10 books). Please return some books before trying again.');
    } else if (result.state === 'Borrow failed.') {
      // Handle borrow failure, possibly invalid book ID, out of stock, or already borrowed
      if (result.InvalidBookIds?.length) {
        showErrorMessage('Borrow failed: Invalid book');
      } else if (result.LowStockBookIds?.length) {
        showErrorMessage('Borrow failed: Out of stock');
      } else if (result.BorrowedBookIds?.length) {
        showErrorMessage('Borrow failed: You have already borrowed this book');
      } else {
        showErrorMessage('Borrow failed: You have already borrowed this book');
      }
    } else {
      // Other error status
      showErrorMessage(`Borrow failed: ${result.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error borrowing book:', error);
    // Check if it's a network error or server error
    if (error.response) {
      // Server returned an error status code
      showErrorMessage(`Borrow request failed: Server returned a ${error.response.status} error`);
    } else if (error.request) {
      // Request sent but no response received
      showErrorMessage('Borrow request failed: Unable to connect to server. Please check your network connection');
    } else {
      // Other error
      showErrorMessage('Error processing borrow request. Please try again later');
    }
  } finally {
    isBorrowing.value = false;
  }
};

const goToTopUp = () => {
  router.push({ path: '/user/profile', query: { view: 'TopUp' } });
  showBalanceDialog.value = false;
};

// Get current book borrowed count
const getBorrowCount = () => {
  // Prefer cached value
  if (borrowCountCache.value > 0) {
    return borrowCountCache.value;
  }

  // In a real environment, this data should come from API
  // Here from mockData or use default value
  if (window.mockData && window.mockData.bookBorrowCount && window.mockData.bookBorrowCount[bookId.value]) {
    borrowCountCache.value = window.mockData.bookBorrowCount[bookId.value];
    return borrowCountCache.value;
  }

  // If no data, calculate from availableCopies and totalCopies
  if (book.value && book.value.availableCopies !== undefined && book.value.totalCopies !== undefined) {
    borrowCountCache.value = book.value.totalCopies - book.value.availableCopies;
    return borrowCountCache.value;
  }

  return 0; // Default value
};

async function readBook() {
  // Check if user is logged in
  if (!userStore.isAuthenticated) {
    loginAction.value = 'read';
    showLoginMessage.value = true;
    return;
  }

  try {
    // Get user's borrow list
    const response = await getBorrowList();

    if (response.state === 'success') {
      // Check if current book is in borrow list
      const isBorrowed = response.data.some(borrow => borrow.bookId === route.params.id);

      if (!isBorrowed) {
        showNeedBorrowMessage.value = true;
        // Close window after 3 seconds
        setTimeout(() => {
          showNeedBorrowMessage.value = false;
        }, 3000);
        return;
      }

      // Get book content
      const { data } = await axios.post('https://api.borrowbee.wcy.one:61700/api/books/content', {
        bookId: route.params.id,
      });

      router.push({
        name: 'Reader',
        query: { url: encodeURIComponent(data.contentURL) },
      });
    } else {
      throw new Error('Failed to get borrow list');
    }
  } catch (e) {
    console.error(e);
    if (e.response) {
      if (e.response.status === 403) {
        showErrorMessage('Your session has expired. Please login again');
        setTimeout(() => {
          router.push({ name: 'Login' });
        }, 3000);
      } else if (e.response.status === 400) {
        showErrorMessage('You need to borrow this book first before reading it');
      } else {
        showErrorMessage('Unable to load e-book. Please try again later');
      }
    } else {
      showErrorMessage('Network error. Please check your connection and try again');
    }
  }
}

// Close borrow success modal
const closeBorrowSuccessModal = () => {
  showBorrowSuccess.value = false;
};

// Close need to borrow first modal
const closeNeedBorrowModal = () => {
  showNeedBorrowMessage.value = false;
};

// Close login modal
const closeLoginModal = () => {
  showLoginMessage.value = false;
};

// Navigate to login page
const goToLogin = () => {
  router.push({ name: 'Login' });
  closeLoginModal();
};

// Show error message modal
const showErrorMessage = (message) => {
  errorMessage.value = message;
  showErrorModal.value = true;
  // Close after 5 seconds
  setTimeout(() => {
    showErrorModal.value = false;
  }, 5000);
};

const closeErrorModal = () => {
  showErrorModal.value = false;
};

// Handle login required event
const handleLoginRequired = (action) => {
  loginAction.value = action;
  showLoginMessage.value = true;
};

const bookId = computed(() => {
  return route.params.id;
});
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
  gap: 15px;
  margin: 25px 0;
  justify-content: space-between;
  align-items: stretch;
  width: 100%;
}

.action-button {
  flex: 1;
  height: 44px;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 0;
  padding: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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

  .action-button {
    width: 100%;
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

.book-rating {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.book-rating .stars {
  display: flex;
  gap: 2px;
}

.book-rating .stars i {
  color: #ffd700;
  font-size: 18px;
}

.book-rating .rating-value {
  color: #666;
  font-size: 14px;
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

.topup-btn {
  background: #4c9fe9;
  color: white;
}

.error-message {
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

/* Login required dialog styles update */
.login-modal-content {
  background: white;
  text-align: center;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.login-required {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-icon {
  width: 60px;
  height: 60px;
  background: #f4f5f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.user-icon i {
  font-size: 30px;
  color: #ff6c00;
}

.login-required h3 {
  font-size: 22px;
  margin-bottom: 10px;
  color: #333;
}

.login-required p {
  color: #666;
  margin-bottom: 25px;
}

.login-modal-actions {
  display: flex;
  gap: 15px;
  width: 100%;
  justify-content: center;
  margin-top: 10px;
}

.login-btn {
  padding: 10px 30px;
  background: #ff6c00;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover {
  background: #e65c00;
}
</style>
