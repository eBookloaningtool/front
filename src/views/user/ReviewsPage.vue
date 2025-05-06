<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-800">我的评论</h1>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-4">
            <p class="text-gray-500">加载中...</p>
          </div>
          <div v-else-if="reviews.length === 0" class="text-center py-8">
            <p class="text-gray-500">您还没有发表过评论</p>
            <RouterLink
              to="/"
              class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              浏览图书
            </RouterLink>
          </div>
          <div v-else>
            <ul class="divide-y divide-gray-200">
              <li v-for="review in reviews" :key="review.id" class="py-4">
                <div class="flex justify-between">
                  <div>
                    <h3 class="text-lg font-medium text-blue-600 cursor-pointer" @click="viewBookDetails(review.bookId)">
                      {{ review.bookTitle }}
                    </h3>
                    <div class="flex items-center mt-1">
                      <div class="flex">
                        <StarRating :rating="review.rating" readonly />
                      </div>
                      <span class="ml-2 text-sm text-gray-500">
                        {{ formatDate(review.createdAt) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex space-x-2">
                    <button
                      @click="editReview(review.id)"
                      class="text-sm text-blue-600 hover:text-blue-800"
                    >
                      编辑
                    </button>
                    <button
                      @click="deleteReview(review.id)"
                      class="text-sm text-red-600 hover:text-red-800"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <p class="mt-2 text-gray-700">{{ review.content }}</p>
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
import StarRating from '../../components/StarRating.vue';

// 获取路由实例
const router = useRouter();

// 响应式状态
const reviews = ref([]);
const loading = ref(true);

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('zh-CN').format(date);
};

// 模拟获取评论数据
onMounted(async () => {
  try {
    // 这里应该是API调用，现在用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500));
    reviews.value = [
      {
        id: 1,
        bookId: 101,
        bookTitle: '三体',
        rating: 5,
        content: '这本书改变了我对科幻小说的看法，刘慈欣的想象力令人惊叹！',
        createdAt: '2023-09-15T14:30:00Z'
      },
      {
        id: 2,
        bookId: 102,
        bookTitle: '百年孤独',
        rating: 4,
        content: '马尔克斯的魔幻现实主义风格非常迷人，但有些段落需要反复阅读才能理解。',
        createdAt: '2023-08-22T10:15:00Z'
      }
    ];
  } catch (error) {
    console.error('获取评论失败:', error);
  } finally {
    loading.value = false;
  }
});

// 查看图书详情 - 页面跳转
const viewBookDetails = (bookId) => {
  router.push(`/books/${bookId}`);
};

// 编辑评论
const editReview = (reviewId) => {
  router.push(`/reviews/${reviewId}/edit`);
};

// 删除评论
const deleteReview = (reviewId) => {
  if (confirm('确定要删除这条评论吗？')) {
    reviews.value = reviews.value.filter(review => review.id !== reviewId);
    // 这里应该有API调用来同步服务器数据
  }
};
</script>
