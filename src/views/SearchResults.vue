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

      <!-- 单独的提示，当有书籍但没有更多时显示 -->
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
  if (params.title) return `搜索结果: ${params.title}`;
  if (params.author) return `作者: ${params.author}`;
  if (params.category) return `分类: ${params.category}`;
  return '搜索结果';
});

const search = async () => {
  // 检查是否有搜索参数
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
      error.value = result.message || '搜索失败，请稍后再试';
    }
  } catch (err) {
    console.error('搜索出错', err);
    error.value = '搜索失败，请稍后再试';
    books.value = [];
  } finally {
    loading.value = false;
  }
};

// 加载更多搜索结果
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
    console.error('加载更多搜索结果失败:', err);
    error.value = '加载更多结果失败，请稍后再试';
  } finally {
    loadingMore.value = false;
  }
};

// 监听滚动事件
const handleScroll = () => {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;

  if (scrollHeight - scrollTop - clientHeight < 100) {
    loadMore();
  }
};

// 监听搜索参数变化
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
  padding-top: 2rem;
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

/* 隐藏BookList中的no-more提示 */
.book-list-wrapper :deep(.no-more) {
  display: none;
}

@media (max-width: 768px) {
  .container {
    padding-top: 1.5rem;
  }
}
</style>
