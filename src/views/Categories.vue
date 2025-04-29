<!-- Categories.vue -->
<template>
  <div class="categories-page">
    <Header />
    <main class="container mx-auto px-6 py-10">
      <div class="page-header">
        <h1 class="text-4xl font-bold text-center mb-4">图书分类</h1>
        <p class="text-gray-600 text-center max-w-2xl mx-auto">
          探索我们的图书分类，发现您感兴趣的书籍。每个分类都包含精心挑选的图书，满足您的阅读需求。
        </p>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
      
      <!-- 错误信息 -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-500">{{ error }}</p>
        <button 
          @click="fetchCategories" 
          class="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          重试
        </button>
      </div>
      
      <!-- 分类和图书列表 -->
      <div v-else class="flex flex-col md:flex-row gap-8 mt-12">
        <!-- 左侧分类卡片列表 -->
        <div class="md:w-1/4">
          <div class="bg-white rounded-xl shadow-lg p-6 sticky top-24">
            <h2 class="text-xl font-semibold mb-6 pb-3 border-b border-gray-100">图书分类</h2>
            <div class="grid grid-cols-1 gap-6">
              <div 
                v-for="category in categories" 
                :key="category.id" 
                @click="selectCategory(category.name)"
                class="category-card p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md"
                :class="{ 'bg-amber-50 ring-2 ring-amber-500': selectedCategory === category.name }"
              >
                <div class="flex items-center space-x-3">
                  <div class="category-icon p-2 rounded-lg bg-amber-50 text-amber-600">
                    <i class="ri-book-2-line text-xl"></i>
                  </div>
                  <span class="text-gray-800 font-medium">{{ category.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧图书列表 -->
        <div class="md:w-3/4">
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 class="text-2xl font-bold text-gray-800">{{ selectedCategory || '所有分类' }}</h2>
                <p class="text-sm text-gray-600 mt-1">{{ selectedCategoryDescription }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">共 {{ categorizedBooks[selectedCategory]?.length || 0 }} 本图书</span>
              </div>
            </div>
            
            <!-- 使用BookList组件 -->
            <BookList 
              v-if="categorizedBooks[selectedCategory] && categorizedBooks[selectedCategory].length > 0"
              :books="categorizedBooks[selectedCategory]" 
              :showHeader="false"
            />
            
            <!-- 无书籍提示 -->
            <div v-else class="text-center py-12">
              <div class="inline-block p-6 rounded-full bg-gray-50 mb-4">
                <i class="ri-book-line text-4xl text-gray-400"></i>
              </div>
              <p class="text-gray-500">该分类暂无图书</p>
              <router-link 
                to="/" 
                class="inline-block mt-4 text-amber-600 hover:text-amber-700 transition-colors"
              >
                浏览其他分类 <i class="ri-arrow-right-line ml-1"></i>
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
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import BookList from '../components/BookList.vue';
import axios from 'axios';
import BookCard from '../components/BookCard.vue';
import { searchBooks, getBookDetail } from '../api/books';

const route = useRoute();
const router = useRouter();
const categories = ref([]);
const categorizedBooks = ref({});
const loading = ref(true);
const error = ref('');
const selectedCategory = ref('');

// 选择分类的方法
const selectCategory = (categoryName) => {
  selectedCategory.value = categoryName;
  // 更新 URL 参数
  router.push({
    path: '/categories',
    query: { category: categoryName }
  });
};

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/categories/getAll');
    if (response.data.state === 'Success') {
      categories.value = response.data.categoriesList;
      // 如果有 URL 参数，设置选中的分类
      if (route.query.category) {
        selectedCategory.value = route.query.category;
      } else if (categories.value.length > 0) {
        // 否则默认选中第一个分类
        selectedCategory.value = categories.value[0].name;
      }
    } else {
      error.value = '获取分类列表失败';
    }
  } catch (err) {
    console.error('获取分类列表失败:', err);
    error.value = '获取分类列表失败，请稍后重试';
  }
};

// 获取特定类别的图书
const fetchBooksByCategory = async (categoryName) => {
  try {
    loading.value = true;
    error.value = '';
    
    // 使用搜索 API 获取特定类别的图书
    const result = await searchBooks({ category: categoryName });
    
    if (result.state === 'success' && result.bookId && result.bookId.length > 0) {
      // 获取每本书的详细信息
      const bookDetails = await Promise.all(
        result.bookId.map(async (bookId) => {
          const bookDetail = await getBookDetail(bookId);
          return bookDetail;
        })
      );
      
      // 过滤掉获取失败的书籍（返回 null 的情况）
      categorizedBooks.value[categoryName] = bookDetails.filter(book => book !== null);
    } else {
      categorizedBooks.value[categoryName] = [];
    }
  } catch (err) {
    console.error('获取分类图书失败:', err);
    error.value = '获取分类图书失败，请稍后重试';
    categorizedBooks.value[categoryName] = [];
  } finally {
    loading.value = false;
  }
};

// 监听选中的分类变化
watch(selectedCategory, (newCategory) => {
  if (newCategory) {
    fetchBooksByCategory(newCategory);
  }
});

// 监听 URL 参数变化
watch(() => route.query.category, (newCategory) => {
  if (newCategory) {
    selectedCategory.value = newCategory;
  }
});

// 组件挂载时获取分类列表
onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.categories-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  padding: 0 10rem;
}

main {
  flex: 1;
  margin-top: 60px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.page-header {
  margin-bottom: 2rem;
  animation: fadeIn 0.5s ease-out;
}

.category-card {
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateX(4px);
  background-color: #fef3c7;
}

.category-icon {
  transition: all 0.3s ease;
}

.category-card:hover .category-icon {
  transform: scale(1.1);
  background-color: #fef3c7;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-header p {
    font-size: 0.9rem;
  }
  
  .category-card {
    padding: 0.75rem;
  }
  
  .categories-page {
    padding: 0 0.5rem;
  }
}
</style> 