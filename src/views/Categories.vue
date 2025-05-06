<!-- Categories.vue -->
<template>
  <div class="categories-page">
    <Header />
    <main class="container mx-auto px-6 py-10">
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
      <!-- 分类列表 - 三列布局 -->
      <div v-else class="mt-4">
        <!-- 三列式分类列表 -->
        <div class="category-grid">
          <div
            v-for="category in categories"
            :key="category.id"
            @click="selectCategory(category.name)"
            class="category-card"
            :class="{ 'active': selectedCategory === category.name }"
          >
            <div class="category-icon">
              <i class="ri-book-2-line"></i>
            </div>
            <div class="category-name">{{ category.name }}</div>
          </div>
        </div>
        <!-- 选中分类的图书列表 -->
        <div v-if="selectedCategory" ref="bookSection" class="book-section mt-12">
          <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div>
              <h2 class="text-2xl font-bold text-gray-800">{{ selectedCategory }}</h2>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-500">Currently {{ categorizedBooks[selectedCategory]?.length || 0 }} books in total. </span>
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
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
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
const bookSection = ref(null);

// 滚动到书本内容区域
const scrollToBooks = () => {
  nextTick(() => {
    if (bookSection.value) {
      bookSection.value.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
};

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
    // 数据加载完成后，滚动到书本区域
    scrollToBooks();
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
}

main {
  flex: 1;
  margin-top: 60px;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

.page-header {
  margin-bottom: 1.5rem;
  animation: fadeIn 0.5s ease-out;
}

/* 三列分类网格布局 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  background-color: #f9f7f4;
  padding: 30px;
  border-radius: 10px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  background-color: #fef3c7;
}

.category-card.active {
  background-color: #fef3c7;
  border: 2px solid #e9a84c;
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #f8f0e3;
  margin-bottom: 10px;
  color: #e9a84c;
  font-size: 24px;
  transition: all 0.3s ease;
}

.category-card:hover .category-icon,
.category-card.active .category-icon {
  background-color: #e9a84c;
  color: white;
}

.category-name {
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  color: #4a5568;
}

.book-section {
  background-color: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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
@media (max-width: 1024px) {
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .categories-page {
    padding: 0 0.5rem;
  }
}
</style>
