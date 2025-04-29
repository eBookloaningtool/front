<template>
  <div class="min-h-screen bg-gray-50 pt-24 pb-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-800">我的评论</h1>
          <span class="text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm font-medium">
            共 {{ reviews.length }} 条评论
          </span>
        </div>
        <div class="p-6">
          <div v-if="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
          </div>
          <div v-else-if="reviews.length === 0" class="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <p class="mt-4 text-gray-500 text-lg">您还没有发表过评论</p>
            <RouterLink
              to="/books"
              class="mt-6 inline-block px-6 py-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors duration-200"
            >
              浏览图书
            </RouterLink>
          </div>
          <div v-else>
            <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {{ error }}
            </div>
            <ul class="divide-y divide-gray-100">
              <li v-for="review in reviews" :key="review.id" class="py-6 hover:bg-gray-50 rounded-lg transition-colors px-4 -mx-4">
                <div class="flex flex-col sm:flex-row sm:justify-between">
                  <div class="flex-grow mb-3 sm:mb-0">
                    <h3
                      class="text-lg font-medium text-amber-600 cursor-pointer hover:text-amber-800 transition-colors"
                      @click="viewBookDetails(review.bookId)"
                    >
                      {{ review.bookTitle }}
                    </h3>
                    <div class="flex items-center mt-2">
                      <div class="flex">
                        <StarRating :rating="review.rating" readonly />
                      </div>
                      <span class="ml-2 text-sm text-gray-500">
                        {{ formatDate(review.createdAt) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex space-x-3">
                    <button
                      @click="editReview(review.id)"
                      class="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      编辑
                    </button>
                    <button
                      @click="deleteReview(review.id)"
                      class="text-sm text-red-600 hover:text-red-800 hover:underline flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      删除
                    </button>
                  </div>
                </div>
                <div class="mt-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p class="text-gray-700">{{ review.content }}</p>
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
import StarRating from '../../components/StarRating.vue';
import { getUserReviews, getReviewContent, deleteReview as apiDeleteReview } from '../../api/reviews';
import { getBookDetail } from '../../api/books';

// 获取路由实例
const router = useRouter();

// 响应式状态
const reviews = ref([]);
const loading = ref(true);
const error = ref(null);

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('zh-CN').format(date);
};

// 获取评论数据
onMounted(async () => {
  try {
    loading.value = true;

    // 使用模拟数据进行开发调试
    // 在生产环境中将替换为真实API调用
    const useMockData = true; // 开发时设为true，生产环境设为false

    if (useMockData) {
      // 模拟数据
      await new Promise(resolve => setTimeout(resolve, 800)); // 模拟网络延迟
      reviews.value = [
        {
          id: '3fc5393d-9fcd-42b0-9801-bd2532bca309',
          bookId: 'book001',
          bookTitle: '三体',
          rating: 5,
          content: '刘慈欣的想象力令人震撼，三体文明的设定非常有创意。这本书完全改变了我对科幻小说的看法，强烈推荐给所有科幻爱好者！',
          createdAt: '2023-09-15T14:30:00Z'
        },
        {
          id: '4ae8291b-3d6a-48c5-9f08-c18a36db5e21',
          bookId: 'book002',
          bookTitle: '百年孤独',
          rating: 4,
          content: '马尔克斯的魔幻现实主义风格非常迷人，但有些段落需要反复阅读才能理解。布恩迪亚家族七代人的故事令人着迷，书中的隐喻和象征手法非常丰富。',
          createdAt: '2023-08-22T10:15:00Z'
        },
        {
          id: '7b52f89d-1e3c-4b12-a01d-9c63a8e32a17',
          bookId: 'book003',
          bookTitle: '哈利·波特与魔法石',
          rating: 5,
          content: '这是我童年最爱的书籍之一，每次重读都能找到新的乐趣。罗琳创造的魔法世界令人向往，角色塑造也非常成功。',
          createdAt: '2023-11-05T18:42:00Z'
        },
        {
          id: '9c24a68b-7d56-4c3f-b321-d814e2095cf6',
          bookId: 'book004',
          bookTitle: '活着',
          rating: 5,
          content: '余华的这本小说令人深思，通过福贵的一生展现了中国近现代史的变迁。文字朴实却蕴含深刻的人生哲理，让人深受触动。',
          createdAt: '2023-12-03T09:20:00Z'
        },
        {
          id: '2e7d9a4c-6b35-4f08-a1e9-5f82c3bdab59',
          bookId: 'book005',
          bookTitle: '红楼梦',
          rating: 4,
          content: '中国古典文学巅峰之作，贾宝玉与林黛玉的爱情故事令人感动，同时也深刻揭示了封建社会的没落。语言优美，人物形象丰满。',
          createdAt: '2024-01-18T15:30:00Z'
        }
      ];
    } else {
      // 使用真实API获取数据
      const userReviewsResponse = await getUserReviews();

      if (userReviewsResponse.comments && userReviewsResponse.comments.length > 0) {
        const reviewsData = [];

        // 获取每条评论的详细内容
        for (const commentID of userReviewsResponse.comments) {
          try {
            const reviewContent = await getReviewContent(commentID);

            // 获取相关书籍信息
            const bookDetails = await getBookDetail(reviewContent.bookId);

            reviewsData.push({
              id: reviewContent.UUID,
              bookId: reviewContent.bookId,
              bookTitle: bookDetails.title,
              rating: reviewContent.rating,
              content: reviewContent.comment,
              createdAt: reviewContent.createdAt || new Date().toISOString()
            });
          } catch (err) {
            console.error(`获取评论 ${commentID} 详情失败:`, err);
          }
        }

        reviews.value = reviewsData;
      }
    }
  } catch (err) {
    console.error('获取评论列表失败:', err);
    error.value = '获取评论列表失败，请稍后再试';
  } finally {
    loading.value = false;
  }
});

// 查看图书详情 - 页面跳转
const viewBookDetails = (bookId) => {
  router.push(`/book/${bookId}`);
};

// 编辑评论 - 可以跳转到图书详情页并自动显示评论编辑界面
const editReview = (reviewId) => {
  const review = reviews.value.find(r => r.id === reviewId);
  if (review) {
    router.push({
      path: `/book/${review.bookId}`,
      query: { editReview: reviewId }
    });
  }
};

// 删除评论
const deleteReview = async (reviewId) => {
  if (confirm('确定要删除这条评论吗？')) {
    try {
      await apiDeleteReview(reviewId);
      reviews.value = reviews.value.filter(review => review.id !== reviewId);
      alert('评论已成功删除');
    } catch (err) {
      console.error('删除评论失败:', err);
      alert('删除评论失败，请稍后再试');
    }
  }
};
</script>
