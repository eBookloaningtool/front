<template>
  <div class="wishlist-container">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">My Wishlist</h2>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-10">
      <div class="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-gray-600">Loading wishlist...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <p class="text-red-600" v-text="error"></p>
      <button
        @click="fetchWishlist"
        class="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition duration-200"
      >
        Reload
      </button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="books.length === 0" class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
      </svg>
      <p class="mt-4 text-lg text-gray-600">Your wishlist is empty</p>
      <p class="mt-2 text-gray-500">Browse books and add your favorites to your wishlist</p>
    </div>

    <!-- 书籍列表 -->
    <div v-else class="space-y-4">
      <div
        v-for="book in books"
        :key="book.id"
        class="flex items-start p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition duration-200"
      >
        <!-- 书籍封面 -->
        <div class="w-24 h-32 flex-shrink-0 mr-4 overflow-hidden rounded">
          <img
            :src="book.coverUrl || '/images/default-cover.jpg'"
            :alt="book.title"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- 书籍信息 -->
        <div class="flex-grow">
          <h3 class="text-lg font-semibold text-gray-800" v-text="book.title"></h3>
          <p class="text-sm text-gray-600" v-text="book.author"></p>
          <p v-if="book.price" class="mt-2 text-orange-500 font-medium">£{{ book.price.toFixed(2) }}</p>
          <div class="mt-3 flex items-center">
            <span
              :class="[
                'text-xs px-2 py-1 rounded-full',
                book.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              ]"
            >
              {{ book.isAvailable ? 'Borrowable' : 'No stock' }}
            </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex flex-col space-y-2">
          <button
            @click="removeFromWishlist(book.id)"
            class="flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition duration-200"
            :disabled="removeLoading[book.id]"
          >
            <svg v-if="removeLoading[book.id]" class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 操作结果提示 -->
    <div
      v-if="notification.show"
      :class="[
        'fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-all duration-500 transform',
        notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
        notification.show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      ]"
      v-text="notification.message"
    >
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { wishlistAPI, bookAPI } from '../services/api';

const books = ref([]);
const loading = ref(false);
const error = ref(null);
const removeLoading = ref({});
const notification = ref({
  show: false,
  message: '',
  type: 'success'
});

// 获取愿望清单
const fetchWishlist = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await wishlistAPI.getWishlist();
    if (response.data && response.data.bookId && Array.isArray(response.data.bookId)) {
      // 获取书籍详情
      await fetchBookDetails(response.data.bookId);
    } else {
      books.value = [];
    }
  } catch (err) {
    console.error('获取愿望清单失败:', err);
    error.value = '获取愿望清单失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

// 获取书籍详情信息
const fetchBookDetails = async (bookIds) => {
  if (!bookIds || bookIds.length === 0) {
    books.value = [];
    return;
  }

  try {
    const response = await bookAPI.getBookDetails(bookIds);
    books.value = response.data;
  } catch (err) {
    console.error('获取书籍详情失败:', err);
    error.value = '获取书籍详情失败，请稍后重试';
  }
};

// 从愿望清单中移除
const removeFromWishlist = async (bookId) => {
  if (removeLoading.value[bookId]) return;

  // 设置当前书籍的加载状态
  removeLoading.value = { ...removeLoading.value, [bookId]: true };

  try {
    await wishlistAPI.removeFromWishlist(bookId);

    // 从列表中移除
    books.value = books.value.filter(book => book.id !== bookId);

    // 显示成功提示
    showNotification('Successfully removed from wishlist', 'success');
  } catch (err) {
    console.error('Failed to remove from wishlist:', err);
    showNotification('Failed to remove from wishlist, please try again', 'error');
  } finally {
    // 清除加载状态
    const newRemoveLoading = { ...removeLoading.value };
    delete newRemoveLoading[bookId];
    removeLoading.value = newRemoveLoading;
  }
};

// 显示通知
const showNotification = (message, type = 'success') => {
  notification.value = {
    show: true,
    message,
    type
  };

  // 3秒后自动关闭
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

onMounted(() => {
  fetchWishlist();
});
</script>
