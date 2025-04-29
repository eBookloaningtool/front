<!-- Categories.vue -->
<template>
  <div class="categories-page">
    <Header />
    <main class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-center mb-8">图书分类</h1>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
      
      <!-- 错误信息 -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-500">{{ error }}</p>
        <button 
          @click="fetchCategories" 
          class="mt-4 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded"
        >
          重试
        </button>
      </div>
      
      <!-- 分类和图书列表 -->
      <div v-else class="flex flex-col md:flex-row gap-8">
        <!-- 左侧分类列表 -->
        <div class="md:w-1/4 bg-white rounded-lg shadow-md p-4">
          <h2 class="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">图书分类</h2>
          <ul class="space-y-2">
            <li 
              v-for="category in categories" 
              :key="category.id" 
              @click="selectCategory(category.id)"
              class="py-2 px-3 rounded cursor-pointer transition-colors hover:bg-amber-50"
              :class="{ 'bg-amber-100 font-medium': selectedCategoryId === category.id }"
            >
              {{ category.name }}
            </li>
          </ul>
        </div>
        
        <!-- 右侧图书列表 -->
        <div class="md:w-3/4 bg-white rounded-lg shadow-md p-4">
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
            <h2 class="text-xl font-semibold">{{ selectedCategory?.name || '所有分类' }}</h2>
            <p class="text-sm text-gray-600">{{ selectedCategory?.description }}</p>
          </div>
          
          <!-- 使用BookList组件 -->
          <BookList 
            v-if="selectedCategoryBooks && selectedCategoryBooks.length > 0"
            :books="selectedCategoryBooks" 
            :showHeader="false"
          />
          
          <!-- 无书籍提示 -->
          <p v-else class="text-gray-500 py-4 text-center">
            该分类暂无图书
          </p>
          
          <!-- 查看全部按钮 -->
          <div v-if="selectedCategoryBooks && selectedCategoryBooks.length > 16" class="mt-8 text-center">
            <router-link 
              :to="`/category/${selectedCategoryId}`" 
              class="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
            >
              查看全部 <i class="ri-arrow-right-line ml-1"></i>
            </router-link>
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
import { categoryAPI, bookAPI } from '../services/api';

const route = useRoute();
const router = useRouter();
const categories = ref([]);
const categorizedBooks = ref([]); // 所有分类及其对应的书籍
const loading = ref(true);
const error = ref(null);
const selectedCategoryId = ref('');
const selectedCategoryBooks = ref([]);

// 根据ID找到选中的分类对象
const selectedCategory = computed(() => {
  return categories.value.find(cat => cat.id === selectedCategoryId.value);
});

// 选择分类的方法
const selectCategory = (categoryId) => {
  selectedCategoryId.value = categoryId;
  
  // 从已加载的分类书籍中查找
  const categoryData = categorizedBooks.value.find(cat => cat.category_id === categoryId);
  if (categoryData && categoryData.books) {
    selectedCategoryBooks.value = categoryData.books;
  } else {
    // 如果在已加载数据中没找到，则重新获取
    fetchBooksByCategory(categoryId);
  }
  
  // 添加导航功能 - 更新URL，但不重新加载页面
  router.push({
    path: '/categories',
    query: { category: categoryId }
  });
};

// 获取所有分类的图书
const fetchCategorizedBooks = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await categoryAPI.getCategoriesWithBooks();
    categorizedBooks.value = response.data.categoriesList || [];
  } catch (err) {
    console.error('获取分类书籍失败:', err);
    error.value = '获取分类书籍失败，请稍后再试';
    categorizedBooks.value = [];
  } finally {
    loading.value = false;
  }
};

// 获取所有分类
const fetchCategories = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await categoryAPI.getAllCategories();
    categories.value = response.data.categoriesList || [];
  } catch (err) {
    console.error('获取分类列表失败:', err);
    error.value = '获取分类列表失败，请稍后再试';
    categories.value = [];
  } finally {
    loading.value = false;
  }
};

// 获取指定分类下的图书
const fetchBooksByCategory = async (categoryId) => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await bookAPI.getBooksByCategory(categoryId);
    selectedCategoryBooks.value = response.data.books || [];
  } catch (err) {
    console.error('获取分类书籍失败:', err);
    error.value = '获取分类书籍失败，请稍后再试';
    selectedCategoryBooks.value = [];
  } finally {
    loading.value = false;
  }
};

// 监听URL参数变化
watch(() => route.query.category, (newCategoryId) => {
  if (newCategoryId && categories.value.some(cat => cat.id === newCategoryId)) {
    selectCategory(newCategoryId);
  }
});

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.categories-page {
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