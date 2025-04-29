<template>
  <div class="book-detail min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-6xl">
      <div v-if="loading" class="flex justify-center items-center h-96">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
      
      <div v-else-if="error" class="text-center py-8">
        <p class="text-red-500 text-lg">{{ error }}</p>
        <button @click="fetchBookDetail" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          重试
        </button>
      </div>
      
      <div v-else class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-8">
          <div class="flex flex-col md:flex-row gap-8">
            <!-- 左侧：书籍封面 -->
            <div class="flex-shrink-0">
              <div class="relative w-64 h-96">
                <img :src="book.coverUrl" :alt="book.title" class="w-full h-full object-cover rounded-lg shadow-lg">
              </div>
            </div>
            
            <!-- 右侧：书籍信息 -->
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-gray-900">{{ book.title }}</h1>
              <p class="text-xl text-gray-600 mt-2">{{ book.author }}</p>
              
              <div class="mt-4 flex items-center">
                <div class="flex items-center">
                  <span class="text-yellow-400 text-xl">★</span>
                  <span class="text-lg text-gray-700 ml-1">{{ book.rating ? book.rating.toFixed(1) : '0.0' }}</span>
                </div>
                <span class="mx-4 text-gray-300">|</span>
                <span class="text-gray-600">借阅次数：{{ book.borrowTimes || 0 }}</span>
              </div>
              
              <div class="mt-6">
                <h2 class="text-lg font-semibold text-gray-900">简介</h2>
                <p class="mt-2 text-gray-600 leading-relaxed">{{ book.description }}</p>
              </div>
              
              <div class="mt-6">
                <h2 class="text-lg font-semibold text-gray-900">分类</h2>
                <span class="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {{ book.category }}
                </span>
              </div>
              
              <div class="mt-6">
                <h2 class="text-lg font-semibold text-gray-900">库存信息</h2>
                <p class="mt-2 text-gray-600">
                  可借阅：{{ book.availableCopies }} / 总数量：{{ book.totalCopies }}
                </p>
              </div>
              
              <div class="mt-8 flex gap-4">
                <button
                  @click="borrowBook"
                  :disabled="!book.availableCopies || isBorrowing"
                  class="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="isBorrowing">借阅中...</span>
                  <span v-else>借阅</span>
                </button>
                <button
                  @click="addToWishlist"
                  :disabled="isAddingToWishlist"
                  class="flex-1 py-3 px-6 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span v-if="isAddingToWishlist">添加中...</span>
                  <span v-else>加入心愿单</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { bookAPI } from '../services/api'
import { useUserStore } from '../stores/userStore'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const book = ref({})
const loading = ref(true)
const error = ref(null)
const isBorrowing = ref(false)
const isAddingToWishlist = ref(false)

const fetchBookDetail = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await bookAPI.getBookDetail(route.params.id)
    book.value = response.data
  } catch (err) {
    console.error('获取书籍详情失败:', err)
    error.value = '获取书籍详情失败，请稍后再试'
  } finally {
    loading.value = false
  }
}

const borrowBook = async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  if (!book.value.availableCopies) {
    error.value = '当前书籍已无可用库存'
    return
  }
  
  isBorrowing.value = true
  try {
    const response = await bookAPI.getBookContent(book.value.bookId)
    // 处理借阅成功后的逻辑，比如跳转到阅读页面
    router.push(response.data.contentURL)
  } catch (err) {
    console.error('借阅失败:', err)
    error.value = '借阅失败，请稍后再试'
  } finally {
    isBorrowing.value = false
  }
}

const addToWishlist = async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  isAddingToWishlist.value = true
  try {
    // 这里需要调用添加心愿单的API
    // await wishlistAPI.addToWishlist(book.value.bookId)
    error.value = '添加成功'
  } catch (err) {
    console.error('添加心愿单失败:', err)
    error.value = '添加失败，请稍后再试'
  } finally {
    isAddingToWishlist.value = false
  }
}

onMounted(() => {
  fetchBookDetail()
})
</script>
