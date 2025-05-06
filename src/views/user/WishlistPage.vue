<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-800">我的愿望清单</h1>
          <p class="text-gray-500 mt-1">管理您收藏的图书</p>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-4">
            <p class="text-gray-500">加载中...</p>
          </div>
          <div v-else-if="wishlistItems.length === 0" class="text-center py-8">
            <p class="text-gray-500">您的愿望清单是空的</p>
            <RouterLink
              to="/"
              class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              浏览图书馆
            </RouterLink>
          </div>
          <div v-else>
            <WishlistComponent
              :items="wishlistItems"
              @remove-item="removeFromWishlist"
              @view-details="viewBookDetails"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import WishlistComponent from '../../components/Wishlist.vue';

// 获取路由实例
const router = useRouter();

// 响应式状态
const wishlistItems = ref([]);
const loading = ref(true);

// 模拟获取愿望清单数据
onMounted(async () => {
  try {
    // 这里应该是API调用，现在用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500));
    wishlistItems.value = [
      {
        id: 1,
        title: '三体',
        author: '刘慈欣',
        cover: '/images/books/threebody.jpg',
        price: '49.00'
      },
      {
        id: 2,
        title: '百年孤独',
        author: '加西亚·马尔克斯',
        cover: '/images/books/solitude.jpg',
        price: '42.50'
      }
    ];
  } catch (error) {
    console.error('获取愿望清单失败:', error);
  } finally {
    loading.value = false;
  }
});

// 从愿望清单移除图书
const removeFromWishlist = (bookId) => {
  wishlistItems.value = wishlistItems.value.filter(item => item.id !== bookId);
  // 这里应该有API调用来同步服务器数据
};

// 查看图书详情 - 页面跳转
const viewBookDetails = (bookId) => {
  router.push(`/books/${bookId}`);
};
</script>
