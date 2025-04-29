<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-800">最近在看</h1>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-4">
            <p class="text-gray-500">加载中...</p>
          </div>
          <div v-else-if="recentBooks.length === 0" class="text-center py-8">
            <p class="text-gray-500">您目前没有正在阅读的图书</p>
            <RouterLink 
              to="/books" 
              class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              浏览图书馆
            </RouterLink>
          </div>
          <div v-else>
            <ul class="divide-y divide-gray-200">
              <li v-for="book in recentBooks" :key="book.id" class="py-4 flex">
                <div class="flex-shrink-0 w-16 h-24 bg-gray-200 rounded overflow-hidden">
                  <img v-if="book.cover" :src="book.cover" alt="书籍封面" class="w-full h-full object-cover" />
                </div>
                <div class="ml-4 flex-1">
                  <div class="flex items-baseline justify-between">
                    <h2 class="text-lg font-medium">{{ book.title }}</h2>
                    <span class="text-sm text-gray-500">阅读进度: {{ book.progress }}%</span>
                  </div>
                  <p class="text-gray-600 text-sm mt-1">{{ book.author }}</p>
                  <div class="mt-2">
                    <button 
                      @click="continueReading(book.id)"
                      class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      继续阅读
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// 获取路由实例
const router = useRouter();

// 响应式状态
const recentBooks = ref([]);
const loading = ref(true);

// 模拟获取最近阅读的图书
onMounted(async () => {
  try {
    // 这里应该是API调用，现在用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500));
    recentBooks.value = [
      { 
        id: 1, 
        title: '三体', 
        author: '刘慈欣', 
        cover: '/images/books/threebody.jpg', 
        progress: 45 
      },
      { 
        id: 2, 
        title: '百年孤独', 
        author: '加西亚·马尔克斯', 
        cover: '/images/books/solitude.jpg', 
        progress: 62 
      }
    ];
  } catch (error) {
    console.error('获取最近阅读图书失败:', error);
  } finally {
    loading.value = false;
  }
});

// 继续阅读函数 - 页面跳转
const continueReading = (bookId) => {
  router.push(`/books/${bookId}/read`);
};
</script> 