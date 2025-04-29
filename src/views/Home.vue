<!-- Home.vue -->
<template>
  <div class="home">
    <Header />
    <main>
      <div class="main-container">
        <SearchSection />
        <LoginSection v-if="!isLoggedIn" />
        <CategoriesSection @category-click="navigateToCategory" />
        <PopularBooks title="热门书籍推荐" @book-click="navigateToBookDetail" />
        <div class="rankings-section">
          <BookList title="新书上架" :books="newBooks" @view-more="viewAllNew" @book-click="navigateToBookDetail" />
          <BookList title="经典小说" :books="fictionBooks" @view-more="viewAllFiction" @book-click="navigateToBookDetail" />
          <BookList title="历史与传记" :books="historyBooks" @view-more="viewAllHistory" @book-click="navigateToBookDetail" />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Header from '../components/Header.vue'
import SearchSection from '../components/SearchSection.vue'
import LoginSection from '../components/LoginSection.vue'
import CategoriesSection from '../components/CategoriesSection.vue'
import BookList from '../components/BookList.vue'
import Footer from '../components/Footer.vue'
import PopularBooks from '../components/PopularBooks.vue'

const router = useRouter()
const isLoggedIn = ref(false)
const newBooks = ref([])
const fictionBooks = ref([])
const historyBooks = ref([])
const loading = ref(true)

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
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, n)
}

// 根据分类筛选书籍
const filterBooksByCategory = (books, category) => {
  return books.filter(book => {
    const bookCategory = book.category.toLowerCase()
    return bookCategory.includes(category.toLowerCase())
  })
}

onMounted(async () => {
  // 检查登录状态
  isLoggedIn.value = !!localStorage.getItem('token')
  
  // 获取所有书籍数据
  try {
    const response = await axios.get('/books.json')
    const allBooks = response.data
    
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

    loading.value = false
  } catch (error) {
    console.error('获取书籍数据失败:', error)
    loading.value = false
    
    // 加载失败时使用空数组
    newBooks.value = []
    fictionBooks.value = []
    historyBooks.value = []
  }
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