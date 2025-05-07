<template>
  <div class="search-results">
    <div class="container mx-auto py-8 px-4 mt-32">

      <div v-if="!loading && books.length === 0 && !error" class="empty-message">
        <p>No more books</p>
      </div>

      <div v-else class="book-list-wrapper">
        <BookList
          :title="title"
          :books="books"
          :loading="loading"
          :error="error"
          :loadingMore="loadingMore"
          :hasMore="hasMore"
          :showHeader="false"
          @retry="search"
        />
      </div>

      <!-- Separate message shown when there are books but no more to load -->
      <div v-if="!loading && !loadingMore && books.length > 0 && !hasMore" class="no-more-books">
        <p>No more books</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { searchBooks, getBookDetail } from '../api/books';
import BookList from '../components/BookList.vue';

const route = useRoute();
const router = useRouter();
const books = ref([]);
const loading = ref(true);
const error = ref('');
const loadingMore = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const pageSize = 10;

const searchParams = computed(() => ({
  title: route.query.title || '',
  author: route.query.author || '',
  category: route.query.category || ''
}));

const title = computed(() => {
  const params = searchParams.value;
  if (params.title) return `Search Results: ${params.title}`;
  if (params.author) return `Author: ${params.author}`;
  if (params.category) return `Category: ${params.category}`;
  return 'Search Results';
});

const search = async () => {
  // Check if there are search parameters
  if (!searchParams.value.title && !searchParams.value.author && !searchParams.value.category) {
    books.value = [];
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = '';
  currentPage.value = 1;

  try {
    const result = await searchBooks({
      ...searchParams.value,
      page: currentPage.value,
      pageSize: pageSize
    });

    if (result.state === 'success') {
      if (result.bookId && result.bookId.length > 0) {
        const bookDetails = await Promise.all(
          result.bookId.map(async (bookId) => {
            const bookDetail = await getBookDetail(bookId);
            return bookDetail;
          })
        );

        books.value = bookDetails.filter(book => book !== null);
        hasMore.value = result.bookId.length === pageSize;
      } else {
        books.value = [];
        hasMore.value = false;
      }
    } else {
      books.value = [];
      error.value = result.message || 'Search failed, please try again later';
    }
  } catch (err) {
    console.error('Search error', err);
    error.value = 'Search failed, please try again later';
    books.value = [];
  } finally {
    loading.value = false;
  }
};

// Load more search results
const loadMore = async () => {
  if (!hasMore.value || loadingMore.value) return;

  loadingMore.value = true;
  currentPage.value++;

  try {
    const result = await searchBooks({
      ...searchParams.value,
      page: currentPage.value,
      pageSize: pageSize
    });

    if (result.state === 'success' && result.bookId && result.bookId.length > 0) {
      const bookDetails = await Promise.all(
        result.bookId.map(async (bookId) => {
          const bookDetail = await getBookDetail(bookId);
          return bookDetail;
        })
      );

      const newBooks = bookDetails.filter(book => book !== null);
      books.value = [...books.value, ...newBooks];
      hasMore.value = newBooks.length === pageSize;
    } else {
      hasMore.value = false;
    }
  } catch (err) {
    console.error('Failed to load more search results:', err);
    error.value = 'Failed to load more results, please try again later';
  } finally {
    loadingMore.value = false;
  }
};

// Listen for scroll events
const handleScroll = () => {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollHeight - scrollTop - clientHeight < 100) {
    loadMore();
  }
};

// Watch for search parameter changes
watch(() => route.query, () => {
  search();
}, { deep: true });

onMounted(() => {
  search();
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.search-results {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding-top: 5rem;
}

.container {
  max-width: 1200px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.book-list-wrapper {
  width: 100%;
}

.no-more-books {
  text-align: center;
  margin-top: 40px;
  margin-bottom: 20px;
  padding: 15px;
  font-size: 16px;
  color: #666;
  border-radius: 8px;
  width: 200px;
  align-self: center;
}

.empty-message {
  text-align: center;
  padding: 30px;
  margin: 20px auto;
  max-width: 300px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-message p {
  font-size: 16px;
  color: #666;
}

/* Hide the no-more message in BookList */
.book-list-wrapper :deep(.no-more) {
  display: none;
}

@media (max-width: 768px) {
  .container {
    padding-top: 1.5rem;
  }
}
</style>
