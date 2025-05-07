<!-- src/components/HistoricalBooks.vue -->
<template>
  <div class="historical-books">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchBooks" class="btn-retry">Retry</button>
    </div>

    <div v-else>
      <div class="history-timeline">
        <div v-for="(group, month) in groupedBooks" :key="month" class="timeline-group">
          <div class="timeline-month">{{ month }}</div>

          <div class="timeline-books">
            <div v-for="book in group" :key="book.bookId" class="timeline-item">
              <div class="timeline-dot"></div>

              <div class="timeline-content">
                <div class="book-card">
                  <div class="book-cover">
                    <img :src="book.coverUrl || '/default-book-cover.jpg'" :alt="book.title" class="cover-img" />
                  </div>

                  <div class="book-info">
                    <h3 class="book-title">{{ book.title }}</h3>
                    <p class="book-author">{{ book.author }}</p>
                    <p class="book-publisher">{{ book.publisher }}</p>

                    <div class="book-actions">
                      <router-link :to="'/book/' + book.bookId" class="btn-view">View details</router-link>
                      <button @click="addToWishlist(book.bookId)" class="btn-wishlist">
                        <span class="wishlist-icon">♡</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, defineProps, onMounted } from 'vue';
import { getBorrowHistory } from '../api/borrowApi';
import { useRouter } from 'vue-router';
import { wishlistAPI } from '../services/api';

const props = defineProps({
  bookIds: {
    type: Array,
    default: () => []
  }
});

const books = ref([]);
const loading = ref(false);
const error = ref(null);

// Router instance
const router = useRouter();

// Watch for bookIds changes
watch(() => props.bookIds, () => {
  if (props.bookIds && props.bookIds.length > 0) {
    fetchBooks();
  } else {
    books.value = [];
  }
}, { immediate: true });

// Group by month for display
const groupedBooks = computed(() => {
  const grouped = {};

  // Mock time data, should actually be from API
  books.value.forEach((book, index) => {
    // Should use actual borrowing date, this is just a mock
    const date = new Date();
    date.setMonth(date.getMonth() - (index % 3)); // Randomly assign to the last 3 months

    const monthKey = date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long'
    });

    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }

    grouped[monthKey].push(book);
  });

  return grouped;
});

// Get book details
const fetchBooks = async () => {
  if (!props.bookIds || props.bookIds.length === 0) return;

  loading.value = true;
  error.value = null;
  books.value = [];

  try {
    // Fetch all book information in parallel
    const bookPromises = props.bookIds.map(bookId =>
      fetch(`/api/books/get?bookId=${bookId}`)
        .then(response => {
          if (!response.ok) throw new Error(`Failed to get book ${bookId}`);
          return response.json();
        })
    );

    const booksData = await Promise.all(bookPromises);
    books.value = booksData;
  } catch (err) {
    console.error('Error getting historical books:', err);
    error.value = 'Failed to get book information, please try again later';
  } finally {
    loading.value = false;
  }
};

// Add to wishlist
const addToWishlist = async (bookId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      // Handle not logged in case
      alert('Please log in first');
      return;
    }

    // Call API to add to wishlist
    const response = await wishlistAPI.addToWishlist(bookId);

    if (response && response.data && response.data.state === 'success') {
      // Successfully added
      console.log(`Successfully added to wishlist: ${bookId}`);

      // Trigger custom event to notify Header component to update wishlist count
      document.dispatchEvent(new CustomEvent('wishlist-updated'));
    } else {
      console.error('Failed to add to wishlist:', response);
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
  }
};
</script>

<style scoped>
.historical-books {
  width: 100%;
}

.history-timeline {
  position: relative;
  padding-left: 20px;
}

.history-timeline::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 2px;
  background-color: #f0c080;
}

.timeline-group {
  margin-bottom: 2rem;
}

.timeline-month {
  font-size: 1.2rem;
  font-weight: 600;
  color: #3a3a3a;
  margin-bottom: 1rem;
  position: relative;
  padding-left: 15px;
}

.timeline-month::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  background-color: #f0c080;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 0 0 2px #f0c080;
}

.timeline-books {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.timeline-item {
  position: relative;
}

.timeline-dot {
  position: absolute;
  top: 20px;
  left: -25px;
  width: 12px;
  height: 12px;
  background-color: #fff;
  border: 2px solid #f0c080;
  border-radius: 50%;
}

.timeline-content {
  padding-left: 15px;
}

.book-card {
  display: flex;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s, box-shadow 0.3s;
}

.book-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.book-cover {
  width: 80px;
  height: 120px;
  flex-shrink: 0;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.book-card:hover .cover-img {
  transform: scale(1.05);
}

.book-info {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 1rem;
  margin: 0 0 0.3rem;
  color: #333;
  font-weight: 600;
}

.book-author {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.book-publisher {
  color: #888;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

.book-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.btn-view {
  padding: 0.4rem 0.8rem;
  background-color: #f0c080;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-view:hover {
  background-color: #e0a060;
}

.btn-wishlist {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f5f5f5;
  color: #666;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  padding: 0;
}

.btn-wishlist:hover {
  background: #f0c080;
  color: white;
}

.wishlist-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #888;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #f0c080;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #f0c080;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-retry:hover {
  background-color: #e0a060;
}

@media (max-width: 640px) {
  .book-card {
    flex-direction: column;
  }

  .book-cover {
    width: 100%;
    height: 140px;
  }

  .timeline-dot {
    top: 70px;
  }
}
</style>
