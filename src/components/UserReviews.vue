<script setup>
import { ref, onMounted } from 'vue';
import { getUserReviews, deleteReview } from '../api/reviews.ts';

const reviews = ref([]);
const loading = ref(false);
const error = ref(null);
const deletingIds = ref(new Set());
const deleteSuccess = ref(false);

// 加载用户评论
const loadUserReviews = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await getUserReviews();
    reviews.value = response.comments || [];
  } catch (err) {
    console.error('获取用户评论失败:', err);
    error.value = '加载评论时出错，请稍后重试';
  } finally {
    loading.value = false;
  }
};

// 删除评论
const handleDeleteReview = async (commentID) => {
  if (!commentID || deletingIds.value.has(commentID)) return;
  
  deletingIds.value.add(commentID);
  
  try {
    const response = await deleteReview(commentID);
    
    if (response.state === 'success') {
      reviews.value = reviews.value.filter(review => review.commentID !== commentID);
      deleteSuccess.value = true;
      
      // 3秒后隐藏成功提示
      setTimeout(() => {
        deleteSuccess.value = false;
      }, 3000);
    } else {
      error.value = '删除评论失败，请稍后重试';
    }
  } catch (err) {
    console.error('删除评论失败:', err);
    error.value = '删除评论时出错，请稍后重试';
  } finally {
    deletingIds.value.delete(commentID);
  }
};

// 格式化评分展示
const formatRating = (rating) => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
};

// 组件挂载时加载用户评论
onMounted(() => {
  loadUserReviews();
});
</script>

<template>
  <div class="user-reviews-container">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">我的评论</h2>
    
    <!-- 成功提示 -->
    <div v-if="deleteSuccess" class="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>
      评论已成功删除！
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg text-center">
      {{ error }}
    </div>
    
    <!-- 无评论提示 -->
    <div v-else-if="reviews.length === 0" class="text-center py-8 text-gray-500">
      您尚未发表任何评论
    </div>
    
    <!-- 评论列表 -->
    <div v-else class="space-y-4">
      <div v-for="review in reviews" 
           :key="review.commentID" 
           class="bg-white p-4 rounded-lg shadow-sm transition-all hover:shadow-md relative">
        <div class="flex justify-between">
          <!-- 评论内容 -->
          <div class="flex-1">
            <div class="flex items-center">
              <span class="text-yellow-500 text-sm mr-2">
                {{ formatRating(review.rating) }}
              </span>
              <span class="text-sm text-gray-500">
                {{ review.bookTitle || '未知书籍' }}
              </span>
            </div>
            <div class="mt-2 text-gray-900">{{ review.comment }}</div>
            <div class="mt-2 text-xs text-gray-500">
              评论日期: {{ review.date || '未知日期' }}
            </div>
          </div>
          
          <!-- 删除按钮 -->
          <button 
            @click="handleDeleteReview(review.commentID)" 
            :disabled="deletingIds.has(review.commentID)"
            class="text-red-500 hover:text-red-700 focus:outline-none transition-colors ml-4"
          >
            <span v-if="deletingIds.has(review.commentID)" class="inline-block w-5 h-5">
              <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            <span v-else class="inline-block w-5 h-5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 刷新按钮 -->
    <div class="flex justify-center mt-6">
      <button 
        @click="loadUserReviews" 
        class="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        刷新列表
      </button>
    </div>
  </div>
</template>

<style scoped>
.user-reviews-container {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

button {
  transition: all 0.2s ease;
}
</style> 