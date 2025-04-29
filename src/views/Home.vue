<!-- Home.vue -->
<template>
  <div class="home">
    <Header />
    <main>
      <div class="main-container">
        <SearchSection />
        <LoginSection v-if="!isLoggedIn" />
        <BookList 
          title="热门书籍推荐" 
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
const pageSize = 10 // 每页显示10本书
const hasMore = ref(true)
const loadingMore = ref(false)

// 路由导航函数
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

// 随机选择n个元素
const getRandomItems = (array, n) => {
  if (!Array.isArray(array) || array.length === 0) {
    return []
  }
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(n, array.length))
}

// 根据分类筛选书籍
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

// 加载更多热门书籍
const loadMorePopularBooks = async () => {
  if (!hasMore.value || loadingMore.value) return
  
  loadingMore.value = true
  try {
    // 获取热门书籍ID列表
    const popularResponse = await bookAPI.getPopularBooks()
    const allBookIds = popularResponse.data.bookId || []
    
    // 计算当前页的书籍ID范围
    const startIndex = (currentPage.value - 1) * pageSize
    const endIndex = startIndex + pageSize
    const currentPageBookIds = allBookIds.slice(startIndex, endIndex)
    
    if (currentPageBookIds.length > 0) {
      // 获取当前页书籍的详细信息
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
    console.error('加载更多热门书籍失败:', err)
    error.value = '加载更多书籍失败，请稍后再试'
  } finally {
    loadingMore.value = false
    loading.value = false
  }
}

// 监听滚动事件
const handleScroll = () => {
  const scrollHeight = document.documentElement.scrollHeight
  const scrollTop = document.documentElement.scrollTop
  const clientHeight = document.documentElement.clientHeight
  
  // 当滚动到距离底部100px时加载更多
  if (scrollHeight - scrollTop - clientHeight < 100) {
    loadMorePopularBooks()
  }
}

onMounted(async () => {
  // 检查登录状态
  isLoggedIn.value = userStore.isAuthenticated
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
  
  try {
    // 初始加载第一页热门书籍
    await loadMorePopularBooks()
    
    // 获取所有书籍数据
    const response = await bookAPI.getAllBooks()
    const allBooks = Array.isArray(response.data) ? response.data : []
    
    // 随机选择10本作为新书展示
    newBooks.value = getRandomItems(allBooks, 10)
    
    // 筛选小说类书籍
    const fictionBooksAll = filterBooksByCategory(allBooks, 'fiction')
    fictionBooks.value = getRandomItems(fictionBooksAll.length > 0 ? fictionBooksAll : allBooks, 10)
    
    // 筛选历史和传记类书籍
    const historyBooksAll = [
      ...filterBooksByCategory(allBooks, 'history'),
      ...filterBooksByCategory(allBooks, 'biography'),
      ...filterBooksByCategory(allBooks, 'memoir')
    ]
    historyBooks.value = getRandomItems(historyBooksAll.length > 0 ? historyBooksAll : allBooks, 10)
  } catch (error) {
    console.error('获取书籍数据失败:', error)
    error.value = '获取书籍数据失败，请稍后再试'
    loading.value = false
    
    // 加载失败时使用空数组
    popularBooks.value = []
    newBooks.value = []
    fictionBooks.value = []
    historyBooks.value = []
  }
})

// 组件卸载时移除滚动监听
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