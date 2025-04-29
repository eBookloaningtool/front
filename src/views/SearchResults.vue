<template>
  <div class="search-results container mx-auto py-8 px-4">
    <h1 class="text-2xl font-bold mb-6">{{ title }}</h1>
    
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{{ error }}</p>
      <button @click="search" class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
        重试
      </button>
    </div>
    
    <div v-else-if="books.length === 0" class="text-center py-8">
      <p class="text-lg text-gray-600">未找到与"{{ searchQuery }}"相关的书籍</p>
      <p class="mt-2 text-gray-500">请尝试使用其他关键词搜索</p>
    </div>
    
    <div v-else>
      <p class="mb-4 text-gray-600">找到 {{ books.length }} 本与"{{ searchQuery }}"相关的书籍</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="book in books" :key="book.bookId" class="book-card" @click="navigateToBookDetail(book.bookId)">
          <BookCard :book="book" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { searchBooks, getBookDetail } from '../api/books';
import BookCard from '../components/BookCard.vue';

export default {
  name: 'SearchResults',
  components: {
    BookCard
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const books = ref([]);
    const loading = ref(true);
    const error = ref('');
    
    const searchQuery = computed(() => route.query.q || '');
    const title = computed(() => searchQuery.value ? `搜索结果: ${searchQuery.value}` : '搜索结果');
    
    const search = async () => {
      if (!searchQuery.value) {
        books.value = [];
        loading.value = false;
        return;
      }
      
      loading.value = true;
      error.value = '';
      
      try {
        console.log("搜索关键词:", searchQuery.value);
        
        // 构建搜索参数
        const searchParams = {
          title: searchQuery.value,
          // 如果有其他搜索条件，可以在这里添加
          // author: route.query.author,
          // category: route.query.category
        };
        
        const result = await searchBooks(searchParams);
        console.log("搜索结果:", result);
        
        if (result.state === 'success') {
          // 获取书籍ID列表后，需要获取每本书的详细信息
          if (result.bookId && result.bookId.length > 0) {
            // 获取每本书的详细信息
            const bookDetails = await Promise.all(
              result.bookId.map(async (bookId) => {
                const bookDetail = await getBookDetail(bookId);
                return bookDetail;
              })
            );
            
            // 过滤掉获取失败的书籍（返回 null 的情况）
            books.value = bookDetails.filter(book => book !== null);
          } else {
            books.value = [];
          }
        } else {
          books.value = [];
          error.value = result.message || '搜索失败，请稍后再试';
          console.error('API请求失败:', result);
        }
      } catch (err) {
        console.error('搜索出错', err);
        error.value = '搜索失败，请稍后再试';
        books.value = [];
      } finally {
        loading.value = false;
      }
    };
    
    // 导航到图书详情页
    const navigateToBookDetail = (bookId) => {
      router.push(`/book/${bookId}`);
    };
    
    // 监听搜索查询变化
    watch(() => route.query.q, () => {
      search();
    });
    
    // 组件挂载时执行搜索
    onMounted(() => {
      search();
    });
    
    return {
      books,
      loading,
      error,
      searchQuery,
      title,
      search,
      navigateToBookDetail
    };
  }
};
</script>

<style scoped>
.book-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style> 