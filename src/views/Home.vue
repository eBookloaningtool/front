<!-- Home.vue -->
<template>
  <div class="home">
    <Header />
    <main>
      <div class="main-container">
        <SearchSection />
        <LoginSection v-if="!isLoggedIn" />
        <BookList
          title="Popular Book Recommendations"
          :books="popularBooks"
          :loading="loading"
          :error="error"
          :loadingMore="loadingMore"
          :hasMore="hasMore"
          @book-click="navigateToBookDetail"
        />
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { bookAPI } from '../services/api'
import { useUserStore } from '../stores/userStore'
import Header from '../components/Header.vue'
import SearchSection from '../components/SearchSection.vue'
import LoginSection from '../components/LoginSection.vue'
import CategoriesSection from '../components/CategoriesSection.vue'
import BookList from '../components/BookList.vue'
import Footer from '../components/Footer.vue'

const router = useRouter()
const userStore = useUserStore()
const isLoggedIn = ref(false)
const newBooks = ref([])
const fictionBooks = ref([])
const historyBooks = ref([])
const popularBooks = ref([])
const loading = ref(true)
const error = ref(null)
const currentPage = ref(1)
const pageSize = 10 // 10 books per page
const hasMore = ref(true)
const loadingMore = ref(false)

// Route navigation functions
const navigateToBooks = (category) => {
  if (category) {
    router.push({ path: '/books', query: { category } })
  } else {
    router.push('/books')
  }
}

const navigateToCategory = (categoryId) => {
  router.push(`/category/${categoryId}`)
}

const navigateToBookDetail = (bookId) => {
  router.push(`/book/${bookId}`)
}

const viewAllNew = () => {
  router.push({ path: '/books', query: { sort: 'newest' } })
}

const viewAllFiction = () => {
  router.push({ path: '/books', query: { category: 'fiction' } })
}

const viewAllHistory = () => {
  router.push({ path: '/books', query: { category: 'history' } })
}

// Randomly select n elements
const getRandomItems = (array, n) => {
  if (!Array.isArray(array) || array.length === 0) {
    return []
  }
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(n, array.length))
}

// Filter books by category
const filterBooksByCategory = (books, category) => {
  if (!Array.isArray(books)) {
    return []
  }
  return books.filter(book => {
    if (!book || !book.category) return false
    const bookCategory = book.category.toLowerCase()
    return bookCategory.includes(category.toLowerCase())
  })
}

// Load more popular books
const loadMorePopularBooks = async () => {
  if (!hasMore.value || loadingMore.value) return

  loadingMore.value = true
  try {
    // Get popular book ID list
    const popularResponse = await bookAPI.getPopularBooks()
    const allBookIds = popularResponse.data.bookId || []

    // Calculate book ID range for current page
    const startIndex = (currentPage.value - 1) * pageSize
    const endIndex = startIndex + pageSize
    const currentPageBookIds = allBookIds.slice(startIndex, endIndex)

    if (currentPageBookIds.length > 0) {
      // Get detailed info for current page books
      const bookDetails = await Promise.all(
        currentPageBookIds.map(bookId => bookAPI.getBookDetail(bookId))
      )

      const newBooks = bookDetails
        .map(response => response.data)
        .filter(book => book !== null)

      popularBooks.value = [...popularBooks.value, ...newBooks]
      currentPage.value++
      hasMore.value = endIndex < allBookIds.length
    } else {
      hasMore.value = false
    }
  } catch (err) {
    console.error('Failed to load more popular books:', err)
    error.value = 'Failed to load more books, please try again later'
  } finally {
    loadingMore.value = false
    loading.value = false
  }
}

// Listen for scroll events
const handleScroll = () => {
  const scrollHeight = document.documentElement.scrollHeight
  const scrollTop = document.documentElement.scrollTop
  const clientHeight = document.documentElement.clientHeight

  // Load more when scrolled to within 100px of bottom
  if (scrollHeight - scrollTop - clientHeight < 100) {
    loadMorePopularBooks()
  }
}

onMounted(async () => {
  // Check login status
  isLoggedIn.value = userStore.isAuthenticated

  // Add scroll listener
  window.addEventListener('scroll', handleScroll)

  try {
    // Initially load first page of popular books
    await loadMorePopularBooks()

    // Get all book data
    const response = await bookAPI.getAllBooks()
    const allBooks = Array.isArray(response.data) ? response.data : []

    // Randomly select 10 books as new books
    newBooks.value = getRandomItems(allBooks, 10)

    // Filter fiction books
    const fictionBooksAll = filterBooksByCategory(allBooks, 'fiction')
    fictionBooks.value = getRandomItems(fictionBooksAll.length > 0 ? fictionBooksAll : allBooks, 10)

    // Filter history and biography books
    const historyBooksAll = [
      ...filterBooksByCategory(allBooks, 'history'),
      ...filterBooksByCategory(allBooks, 'biography'),
      ...filterBooksByCategory(allBooks, 'memoir')
    ]
    historyBooks.value = getRandomItems(historyBooksAll.length > 0 ? historyBooksAll : allBooks, 10)
  } catch (error) {
    console.error('Failed to get book data:', error)
    error.value = 'Failed to get book data, please try again later'
    loading.value = false

    // Use empty arrays when loading fails
    popularBooks.value = []
    newBooks.value = []
    fictionBooks.value = []
    historyBooks.value = []
  }
})

// Remove scroll listener when component is unmounted
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  width: 100%;
}

.main-container {
  max-width: 1200px;
  margin: 60px auto 0;
  padding: 20px;
}

.rankings-section {
  margin-top: 40px;
}
</style>
