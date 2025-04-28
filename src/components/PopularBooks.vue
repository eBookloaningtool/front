<template>
  <div class="popular-books">
    <h2 class="text-xl font-bold mb-4">{{ title }}</h2>
    
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
    
    <div v-else-if="error" class="text-red-500 py-4">
      {{ error }}
    </div>
    
    <div v-else-if="books.length === 0" class="py-4">
      暂无热门书籍
    </div>
    
    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <div v-for="book in books" :key="book.bookId" class="book-card">
        <BookCard :book="book" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { getPopularBooks, getBookDetail } from '../api/books';
import BookCard from './BookCard.vue';

export default {
  name: 'PopularBooks',
  components: {
    BookCard
  },
  props: {
    category: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: '热门书籍'
    }
  },
  setup(props) {
    const books = ref([]);
    const loading = ref(true);
    const error = ref('');
    
    const fetchPopularBooks = async () => {
      loading.value = true;
      error.value = '';
      
      try {
        const result = await getPopularBooks(props.category);
        const bookIds = result.bookId || [];
        
        // 获取每本书的详细信息
        const bookDetailsPromises = bookIds.map(id => getBookDetail(id));
        const bookDetails = await Promise.all(bookDetailsPromises);
        
        // 过滤掉可能的null值
        books.value = bookDetails.filter(book => book !== null);
      } catch (err) {
        console.error('加载热门书籍失败', err);
        error.value = '加载热门书籍失败，请稍后再试';
      } finally {
        loading.value = false;
      }
    };
    
    // 监听分类变化，重新获取数据
    watch(() => props.category, () => {
      fetchPopularBooks();
    });
    
    // 组件挂载时获取数据
    onMounted(() => {
      fetchPopularBooks();
    });
    
    return {
      books,
      loading,
      error
    };
  }
};
</script>

<style scoped>
.book-card {
  transition: transform 0.3s ease;
}

.book-card:hover {
  transform: translateY(-5px);
}
</style> 