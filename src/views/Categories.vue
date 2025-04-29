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
              @click="selectCategory(category.name)"
              class="py-2 px-3 rounded cursor-pointer transition-colors hover:bg-amber-50"
              :class="{ 'bg-amber-100 font-medium': selectedCategory === category.name }"
            >
              {{ category.name }}
            </li>
          </ul>
        </div>
        
        <!-- 右侧图书列表 -->
        <div class="md:w-3/4 bg-white rounded-lg shadow-md p-4">
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
            <h2 class="text-xl font-semibold">{{ selectedCategory || '所有分类' }}</h2>
            <p class="text-sm text-gray-600">{{ selectedCategoryDescription }}</p>
          </div>
          
          <!-- 使用BookList组件 -->
          <BookList 
            v-if="categorizedBooks[selectedCategory] && categorizedBooks[selectedCategory].length > 0"
            :books="categorizedBooks[selectedCategory]" 
            :showHeader="false"
          />
          
          <!-- 无书籍提示 -->
          <p v-else class="text-gray-500 py-4 text-center">
            该分类暂无图书
          </p>
          
          <!-- 查看全部按钮 -->
          <div v-if="categorizedBooks[selectedCategory] && categorizedBooks[selectedCategory].length > 16" class="mt-8 text-center">
            <router-link 
              :to="`/category/${selectedCategory}`" 
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