<!-- BookList.vue -->
<template>
  <div class="book-list-section">
    <!-- Title section -->
    <div class="book-list-header" v-if="showHeader">
      <h2 class="title">{{ title }}</h2>
      <router-link v-if="moreLink" :to="moreLink" class="view-more">
        View more <i class="ri-arrow-right-s-line"></i>
      </router-link>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading">
      <div class="simple-spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="errorMessage" class="error">
      <p>{{ errorMessage }}</p>
      <button @click="$emit('retry')" class="retry-btn">Retry</button>
    </div>

    <!-- Normal display of books -->
    <div v-else-if="displayBooks.length > 0" :class="['book-container', layoutClass]">
      <template v-if="useSimpleLayout">
        <div v-for="book in displayBooks" :key="book.id" class="book-item">
          <router-link :to="`/book/${book.id}`" class="book-link">
            <div class="book-cover-container">
              <img
                :src="book.cover"
                :alt="book.title"
                @error="e => e.target.src = defaultCover"
              />
            </div>
            <div class="book-info">
              <h3 class="book-title">{{ book.title }}</h3>
              <p class="book-author">{{ book.author }}</p>
            </div>
          </router-link>
        </div>
      </template>
      <template v-else>
        <BookCard
          v-for="book in displayBooks"
          :key="book.id"
          :book="book"
          :showRating="showRating"
          :showWishlist="showWishlist"
        />
      </template>

      <!-- Load more prompt -->
      <div v-if="loadingMore" class="loading-more">
        <div class="simple-spinner"></div>
        <p>Loading more...</p>
      </div>

      <!-- No more data prompt -->
      <div v-else-if="!hasMore" class="no-more">
        <p>No more books</p>
      </div>
    </div>

    <!-- No data -->
    <div v-else class="empty-state">
      <p>No data available</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BookCard from './BookCard.vue'

const props = defineProps({
  title: { type: String, default: '' },
  moreLink: { type: String, default: '' },
  books: { type: Array, default: () => [] },
  loadBooks: { type: Function, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  layout: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'simple', 'list'].includes(value)
  },
  showRating: { type: Boolean, default: true },
  showWishlist: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true },
  loadingMore: { type: Boolean, default: false },
  hasMore: { type: Boolean, default: true }
});

const emit = defineEmits(['retry']);

const defaultCover = 'https://source.unsplash.com/collection/1320303/300x450?sig=fallback';
const localBooks = ref([]);
const localLoading = ref(!!props.loadBooks);
const localError = ref('');

const isLoading = computed(() => props.loading || localLoading.value);
const errorMessage = computed(() => props.error || localError.value);
const displayBooks = computed(() => props.books.length > 0 ? props.books : localBooks.value);

const useSimpleLayout = computed(() => ['simple', 'list'].includes(props.layout));
const layoutClass = computed(() => {
  switch (props.layout) {
    case 'simple': return 'simple-layout';
    case 'list': return 'list-layout';
    default: return 'grid-layout';
  }
});

onMounted(async () => {
  if (props.loadBooks) {
    localLoading.value = true;
    try {
      localBooks.value = await props.loadBooks();
    } catch (error) {
      console.error('Failed to get book list:', error);
      localError.value = 'Failed to get data, please try again later';
    } finally {
      localLoading.value = false;
    }
  }
});
</script>

<style scoped>
.book-list-section {
  margin-bottom: 40px;
  position: relative;
  min-height: 200px;
}

/* Header styles */
.book-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

.title {
  font-size: 20px;
  color: #333;
}

.view-more {
  color: #e9a84c;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.view-more:hover {
  color: #d89638;
}

/* Loading styles */
.loading,
.loading-more {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.simple-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0,0,0,0.1);
  border-top-color: #e9a84c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error, retry */
.error {
  text-align: center;
  color: #e74c3c;
  padding: 20px;
}

.retry-btn {
  margin-top: 10px;
  background: #e9a84c;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #d89638;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 40px;
  color: #777;
  font-style: italic;
}

/* Grid layout */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

/* Simple layout */
.simple-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 15px;
}

/* List layout */
.list-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Load more prompt */
.loading-more {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.loading-more .simple-spinner {
  margin: 0 auto 10px;
}

/* No more data prompt */
.no-more {
  text-align: center;
  padding: 20px 0;
  color: #999;
  font-size: 14px;
}

@media (max-width: 768px) {
  .grid-layout, .simple-layout {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 480px) {
  .grid-layout, .simple-layout {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
