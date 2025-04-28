<!-- Books.vue -->
<template>
  <div class="books-page">
    <Header />
    <main class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8">图书馆藏</h1>
      <BookList 
        :books="books" 
        :loading="loading" 
        :error="error"
        layout="grid"
        :showHeader="false"
        @retry="fetchBooks"
      />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import BookList from '../components/BookList.vue'

const books = ref([])
const loading = ref(true)
const error = ref(null)

const fetchBooks = async () => {
  loading.value = true
  error.value = null
  
  try {
    if (window.mockMode) {
      // 使用mock数据
      console.log('使用mock数据获取书籍列表');
      setTimeout(async () => {
        const mockApi = await import('../mock-api.js');
        books.value = mockApi.getMockBooks();
        loading.value = false;
      }, 500);
    } else {
      // 实际API调用
      console.log('从API获取书籍列表');
      const response = await axios.get('/api/books');
      books.value = response.data;
      loading.value = false;
    }
  } catch (err) {
    console.error('获取书籍数据失败:', err)
    error.value = '获取书籍数据失败，请稍后再试'
    loading.value = false
  }
}

onMounted(() => {
  fetchBooks()
})
</script>

<style scoped>
.books-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 