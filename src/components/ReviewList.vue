<script setup>
import { ref, onMounted, watch } from 'vue';
import { getBookReviews } from '../api/reviews.ts';

const props = defineProps({
  bookId: {
    type: String,
    required: true
  }
});

const comments = ref([]);
const loading = ref(false);
const error = ref(null);

// 加载评论
const loadComments = async () => {
  if (!props.bookId) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const response = await getBookReviews(props.bookId);
    comments.value = response.comments || [];
  } catch (err) {
    console.error('获取评论失败:', err);
    error.value = '加载评论时出错，请稍后重试';
  } finally {
    loading.value = false;
  }
};

// 监听bookId变化，重新加载评论
watch(() => props.bookId, (newVal) => {
  if (newVal) {
    loadComments();
  }
});

// 组件挂载时加载评论
onMounted(() => {
  loadComments();
});

// 格式化评分展示
const formatRating = (rating) => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
};
</script>

<template>
  <div class="review-list-container space-y-4">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">读者评论</h2>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg text-center">
      {{ error }}
    </div>
    
    <!-- 无评论提示 -->
    <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500">
      暂无评论，成为第一个评论的读者吧！
    </div>
    
    <!-- 评论列表 -->
    <div v-else class="space-y-4">
      <div v-for="(comment, index) in comments" 
           :key="index" 
           class="bg-white p-4 rounded-lg shadow-sm transition-shadow hover:shadow-md">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-yellow-500 text-sm mb-1">
              {{ formatRating(comment.rating) }}
            </div>
            <div class="text-gray-900">{{ comment.comment }}</div>
          </div>
          <div class="text-xs text-gray-500">
            {{ comment.date || '未知日期' }}
          </div>
        </div>
        <div class="mt-2 text-sm text-gray-500">
          评论者: {{ comment.userName || '匿名用户' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-list-container {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style> 