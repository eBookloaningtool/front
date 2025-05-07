<!-- Books.vue -->
<template>
  <div class="books-page">
    <Header />
    <main class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8">Library Collection</h1>
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
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
import BookList from '../components/BookList.vue'
import { bookAPI } from '../services/api'

const books = ref([])
const loading = ref(true)
const error = ref(null)

const fetchBooks = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await bookAPI.getAllBooks()
    books.value = response.data.books || []
  } catch (err) {
    console.error('Failed to get book list:', err)
    error.value = 'Failed to get book list, please try again later'
    books.value = []
  } finally {
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