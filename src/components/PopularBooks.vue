<template>
  <div class="popular-books">
    <h2 class="text-2xl font-bold mb-6">{{ title }}</h2>
    <div v-if="loading" class="flex justify-center items-center h-48">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
    <div v-else-if="error" class="text-red-500 text-center py-8">
      {{ error }}
    </div>
    <div v-else-if="books.length === 0" class="text-gray-500 text-center py-8">
      暂无热门书籍
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <div v-for="book in books" :key="book.bookId" class="book-card" @click="$emit('book-click', book.bookId)">
        <div class="relative pb-[140%]">
          <img :src="book.coverUrl" :alt="book.title" class="absolute inset-0 w-full h-full object-cover rounded-lg shadow-md">
        </div>
        <div class="mt-4">
          <h3 class="font-medium text-gray-900 line-clamp-2">{{ book.title }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ book.author }}</p>
          <div class="flex items-center mt-2">
            <span class="text-yellow-400">★</span>
            <span class="text-sm text-gray-600 ml-1">{{ book.rating ? book.rating.toFixed(1) : '0.0' }}</span>
            <span class="text-sm text-gray-500 ml-2">借阅: {{ book.borrowTimes || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { bookAPI } from '../services/api'

const props = defineProps({
  title: {
    type: String,
    default: '热门书籍'
  }
})

defineEmits(['book-click'])

const books = ref([])
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    // 获取热门书籍ID列表
    const popularResponse = await bookAPI.getPopularBooks()
    const popularBookIds = popularResponse.data.bookId || []
    
    if (popularBookIds.length === 0) {
      books.value = []
      return
    }
    
    // 获取热门书籍详情
    const popularBooksDetails = await Promise.all(
      popularBookIds.map(bookId => bookAPI.getBookDetail(bookId))
    )
    books.value = popularBooksDetails
      .map(response => response.data)
      .filter(book => book !== null)
  } catch (err) {
    console.error('获取热门书籍失败:', err)
    error.value = '获取热门书籍失败，请稍后再试'
    books.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.book-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.book-card:hover {
  transform: translateY(-4px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 