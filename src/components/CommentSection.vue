<!-- CommentSection.vue -->
<template>
  <div class="comment-section">
    <h2 class="section-title">用户评论</h2>
    
    <div class="comment-form" v-if="isLoggedIn">
      <h3>发表评论</h3>
      <div class="rating-input">
        <span>评分：</span>
        <div class="star-rating">
          <i v-for="n in 5" 
             :key="n" 
             :class="['ri-star-' + (n <= currentRating ? 'fill' : 'line')]"
             @mouseover="updateStars(n, true)"
             @mouseout="updateStars(currentRating)"
             @click="setRating(n)">
          </i>
        </div>
      </div>
      <textarea v-model="commentText" 
                placeholder="写下你的评论..."
                @input="validateComment">
      </textarea>
      <button class="submit-comment" 
              :disabled="!isValid"
              @click="submitComment">
        发表评论
      </button>
    </div>
    
    <div v-else class="login-prompt">
      <p>登录后才能发表评论</p>
      <button class="login-btn" @click="redirectToLogin">登录</button>
    </div>

    <div class="comments-list">
      <div v-for="comment in comments" 
           :key="comment.id" 
           class="review-item">
        <div class="review-header">
          <span class="reviewer">{{ comment.username }}</span>
          <div class="star-display">
            <i v-for="n in 5" 
               :key="n" 
               :class="['ri-star-' + (n <= comment.rating ? 'fill' : 'line')]">
            </i>
            <span class="review-rating">{{ comment.rating }}.0</span>
          </div>
        </div>
        <p class="review-content">{{ comment.content }}</p>
        <div class="review-date">{{ formatDate(comment.createdAt) }}</div>
      </div>
      
      <div v-if="comments.length === 0" class="no-comments">
        <p>暂无评论，快来发表第一条评论吧！</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  bookId: {
    type: [String, Number],
    required: true
  }
})

const router = useRouter()
const isLoggedIn = ref(false)
const comments = ref([])
const commentText = ref('')
const currentRating = ref(0)
const isValid = ref(false)

const updateStars = (rating, isHover = false) => {
  if (isHover) {
    currentRating.value = rating
  } else {
    currentRating.value = rating
  }
}

const setRating = (rating) => {
  currentRating.value = rating
  validateComment()
}

const validateComment = () => {
  isValid.value = commentText.value.trim().length > 0 && currentRating.value > 0
}

const redirectToLogin = () => {
  router.push('/login')
}

const formatDate = (dateString) => {
  if (!dateString) return '未知时间'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const submitComment = async () => {
  if (!isValid.value) return

  try {
    // 模拟添加评论，实际项目中应调用API
    const newComment = {
      id: Date.now(),
      username: '当前用户',
      rating: currentRating.value,
      content: commentText.value.trim(),
      createdAt: new Date().toISOString()
    }
    
    comments.value.unshift(newComment)
    commentText.value = ''
    currentRating.value = 0
    isValid.value = false
    
    // 实际API请求
    /*
    const response = await fetch(`/api/reviews/book?bookId=${props.bookId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        rating: currentRating.value,
        content: commentText.value.trim()
      })
    })

    if (response.ok) {
      const newComment = await response.json()
      comments.value.unshift(newComment)
      commentText.value = ''
      currentRating.value = 0
      isValid.value = false
    }
    */
  } catch (error) {
    console.error('提交评论失败:', error)
  }
}

const loadComments = async () => {
  try {
    // 模拟加载评论，实际项目中应调用API
    comments.value = [
      {
        id: 1,
        username: 'user123',
        rating: 5,
        content: '这本书很精彩！情节吸引人，人物刻画得很好。',
        createdAt: '2023-10-15T12:34:56Z'
      },
      {
        id: 2,
        username: 'user456',
        rating: 4,
        content: '我非常喜欢这本书中的见解，强烈推荐。',
        createdAt: '2023-09-20T15:30:00Z'
      },
      {
        id: 3,
        username: 'user789',
        rating: 4,
        content: '一个真正鼓舞人心的故事，信息量很大。',
        createdAt: '2023-08-05T09:15:30Z'
      }
    ]
    
    // 实际API请求
    /*
    const response = await fetch(`/api/reviews/book?bookId=${props.bookId}`)
    if (response.ok) {
      comments.value = await response.json()
    }
    */
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

onMounted(() => {
  isLoggedIn.value = !!localStorage.getItem('token')
  loadComments()
})
</script>

<style scoped>
.comment-section {
  margin: 40px 0;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.section-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 24px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

.comment-form {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.comment-form h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #555;
  font-size: 18px;
}

.rating-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.star-rating {
  display: flex;
  gap: 5px;
}

.star-rating i {
  font-size: 24px;
  color: #ffd700;
  cursor: pointer;
  transition: transform 0.2s;
}

.star-rating i:hover {
  transform: scale(1.2);
}

textarea {
  width: 100%;
  height: 120px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 15px;
  resize: vertical;
  font-size: 14px;
  transition: border-color 0.3s;
}

textarea:focus {
  border-color: #4a90e2;
  outline: none;
}

.submit-comment {
  background-color: #4a90e2;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s, transform 0.2s;
}

.submit-comment:hover:not(:disabled) {
  background-color: #357abd;
  transform: translateY(-2px);
}

.submit-comment:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-prompt {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
}

.login-prompt p {
  margin-bottom: 15px;
  color: #666;
}

.login-btn {
  background-color: #4a90e2;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #357abd;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.review-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.reviewer {
  font-weight: 500;
  color: #444;
}

.star-display {
  display: flex;
  align-items: center;
  gap: 5px;
}

.star-display i {
  font-size: 16px;
  color: #ffd700;
}

.review-rating {
  color: #666;
  font-weight: 500;
  margin-left: 5px;
}

.review-content {
  color: #555;
  line-height: 1.6;
  margin-bottom: 10px;
}

.review-date {
  font-size: 12px;
  color: #999;
  text-align: right;
}

.no-comments {
  text-align: center;
  padding: 30px 0;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .comment-section {
    padding: 20px;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style> 