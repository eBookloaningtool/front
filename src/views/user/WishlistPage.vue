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
import { getWishlist, getBookDetail } from '../../api/booksApi';
import { useToast } from '../../composables/useToast';

// 获取路由实例
const router = useRouter();
const { showToast } = useToast();

// 响应式状态
const wishlistItems = ref([]);
const loading = ref(true);

// 获取愿望清单数据
onMounted(async () => {
  loading.value = true;
  try {
    // 获取愿望清单中的书籍ID列表
    const wishlistData = await getWishlist();

    if (wishlistData.bookId && wishlistData.bookId.length > 0) {
      // 获取每本书的详情
      const bookPromises = wishlistData.bookId.map(bookId => getBookDetail(bookId));
      const bookDetails = await Promise.all(bookPromises);

      // 转换数据格式
      wishlistItems.value = bookDetails.map(book => ({
        id: book.bookId,
        title: book.title,
        author: book.author,
        cover: book.coverUrl,
        price: book.price.toFixed(2)
      }));
    }
  } catch (error) {
    console.error('获取愿望清单失败:', error);
    showToast('获取愿望清单失败，请稍后重试', 'error');
  } finally {
    loading.value = false;
  }
});

// 从愿望清单移除图书
const removeFromWishlist = async (bookId) => {
  try {
    const response = await import('../../api/booksApi').then(module => module.removeFromWishlist(bookId));

    if (response.state === 'success') {
      wishlistItems.value = wishlistItems.value.filter(item => item.id !== bookId);
      showToast('已从愿望清单中移除', 'success');
    } else {
      throw new Error('移除失败');
    }
  } catch (error) {
    console.error('移除书籍失败:', error);
    showToast('移除书籍失败，请稍后重试', 'error');
  }
};

// 查看图书详情 - 页面跳转
const viewBookDetails = (bookId) => {
  router.push(`/books/${bookId}`);
};
</script>
