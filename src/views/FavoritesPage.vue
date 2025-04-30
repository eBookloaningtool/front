<template>
  <div class="favorites-page">
    <Header />
    <main class="container mx-auto px-4 py-8">
      <div class="page-header">
        <h1 class="text-3xl font-bold">心愿单</h1>
        <p class="text-gray-600 mt-2">您想要的书籍将在这里显示</p>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="text-gray-500">加载中...</p>
      </div>

      <div v-else-if="favoriteBooks.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="ri-heart-line"></i>
        </div>
        <p class="text-gray-500">您的心愿单中还没有书籍</p>
        <router-link to="/" class="browse-btn">
          浏览图书馆
        </router-link>
      </div>

      <div v-else class="favorites-grid">
        <div v-for="book in favoriteBooks" :key="book.bookId" class="book-card">
          <div class="book-cover">
            <img
              :src="book.coverUrl || book.cover"
              :alt="book.title"
              class="w-full h-full object-cover"
              @error="e => e.target.src = fallbackCover"
            />

          </div>
          <div class="book-info">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">{{ book.author }}</p>
            <div class="book-actions">
              <router-link :to="`/book/${book.bookId}`" class="view-btn">
                查看详情
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'

const loading = ref(true)
const favoriteBooks = ref([])
const fallbackCover = 'https://source.unsplash.com/collection/1320303/300x450?sig=fallback'

const loadFavoriteBooks = async () => {
  loading.value = true
  try {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
    const books = []

    for (const bookId of favorites) {
      const bookData = JSON.parse(localStorage.getItem(`book_${bookId}`))
      if (bookData) {
        books.push(bookData)
      }
    }

    favoriteBooks.value = books
  } catch (error) {
    console.error('加载收藏书籍失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理收藏状态变化
const handleFavoriteChange = ({ bookId, isFavorite }) => {
  if (!isFavorite) {
    // 如果取消收藏，从列表中移除该书籍
    favoriteBooks.value = favoriteBooks.value.filter(book => book.bookId !== bookId)
  }
}

onMounted(() => {
  loadFavoriteBooks()
})
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.page-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eee;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #e9a84c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 0;
}

.empty-icon {
  font-size: 4rem;
  color: #e9a84c;
  margin-bottom: 1rem;
}

.browse-btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #e9a84c;
  color: white;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: background-color 0.3s;
}

.browse-btn:hover {
  background-color: #d89638;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1rem 0;
}

.book-card {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.book-cover {
  position: relative;
  aspect-ratio: 2/3;
  overflow: hidden;
}

.book-info {
  padding: 1rem;
}

.book-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.5rem;
}

.book-author {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1rem;
}

.book-actions {
  margin-top: auto;
}

.view-btn {
  display: block;
  text-align: center;
  padding: 0.5rem;
  background-color: #f8f9fa;
  color: #e9a84c;
  border-radius: 0.25rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.view-btn:hover {
  background-color: #e9a84c;
  color: white;
}

@media (max-width: 768px) {
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .book-title {
    font-size: 0.875rem;
  }

  .book-author {
    font-size: 0.75rem;
  }
}
</style>
