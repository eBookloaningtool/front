<!-- CategoryDetail.vue -->
<template>
  <div class="category-detail-page">
    <Header />
    <main class="container mx-auto px-4 py-8">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
      
      <!-- 错误信息 -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-500">{{ error }}</p>
        <button 
          @click="fetchCategory" 
          class="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded"
        >
          重试
        </button>
        <div class="mt-4">
          <router-link to="/categories" class="text-blue-500 hover:underline">
            返回所有分类
          </router-link>
        </div>
      </div>
      
      <!-- 分类内容 -->
      <div v-else>
        <div class="mb-8 flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold">{{ category.name }}</h1>
            <p class="text-gray-600 mt-2">{{ category.description }}</p>
          </div>
          <router-link to="/categories" class="text-amber-500 hover:underline flex items-center">
            <i class="ri-arrow-left-line mr-1"></i> 所有分类
          </router-link>
        </div>
        
        <!-- 书籍列表 -->
        <div v-if="books && books.length > 0">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <div 
              v-for="book in books" 
              :key="book.id" 
              class="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1"
            >
              <router-link :to="`/book/${book.id}`" class="block h-full">
                <div class="relative aspect-[2/3] overflow-hidden bg-gray-100">
                  <img 
                    :src="book.cover" 
                    :alt="book.title"
                    class="w-full h-full object-cover"
                    @error="e => e.target.src = 'https://source.unsplash.com/collection/1320303/300x450?sig=fallback'"
                  />
                </div>
                <div class="p-4">
                  <h3 class="font-semibold text-gray-800 line-clamp-2 mb-1">{{ book.title }}</h3>
                  <p class="text-sm text-gray-600">{{ book.author }}</p>
                </div>
              </router-link>
            </div>
          </div>
        </div>
        
        <!-- 无书籍提示 -->
        <div v-else class="text-center py-12">
          <p class="text-gray-500">该分类暂无图书</p>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import { categoryAPI, bookAPI } from '../services/api';

const route = useRoute();
const router = useRouter();
const categoryId = computed(() => route.params.id);
const category = ref({});
const books = ref([]);
const loading = ref(true);
const error = ref(null);

// 导航到书籍详情页
const navigateToBook = (bookId) => {
  router.push(`/book/${bookId}`);
};

const fetchCategory = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // 获取分类信息
    const categoryResponse = await categoryAPI.getCategoryDetail(categoryId.value);
    category.value = categoryResponse.data;
    
    // 获取该分类下的图书
    const booksResponse = await bookAPI.getBooksByCategory(categoryId.value);
    books.value = booksResponse.data;
    
    loading.value = false;
  } catch (err) {
    console.error('获取分类数据失败:', err);
    error.value = '获取分类数据失败，请稍后再试';
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategory();
});
</script>

<style scoped>
.category-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  margin-top: 60px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 