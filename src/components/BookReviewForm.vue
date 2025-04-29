<!-- BookReviewForm.vue -->
<template>
  <div class="review-form-container">
    <h2 class="form-title">添加评论</h2>

    <div v-if="isLoggedIn" class="review-form">
      <div class="rating-section">
        <p class="rating-label">评分：</p>
        <div class="star-rating">
          <i
            v-for="n in 5"
            :key="n"
            :class="['ri-star-' + (n <= (hoverRating || rating) ? 'fill' : 'line')]"
            @mouseover="hoverRating = n"
            @mouseleave="hoverRating = 0"
            @click="rating = n"
          ></i>
        </div>
        <span class="rating-value" v-if="rating">{{ rating }}.0</span>
      </div>

      <div class="comment-section">
        <label for="comment" class="comment-label">评论内容：</label>
        <textarea
          id="comment"
          v-model="comment"
          :class="{ 'error': showError && !comment.trim() }"
          placeholder="请分享您对这本书的看法..."
        ></textarea>
        <p v-if="showError && !comment.trim()" class="error-message">请输入评论内容</p>
      </div>

      <div class="submit-section">
        <button
          class="submit-button"
          :disabled="submitting"
          @click="submitReview"
        >
          {{ submitting ? '提交中...' : '提交评论' }}
        </button>
      </div>

      <div v-if="submitMessage" :class="['submit-message', submitStatus]">
        {{ submitMessage }}
      </div>
    </div>

    <div v-else class="login-prompt">
      <p>请先登录后再发表评论</p>
      <button class="login-button" @click="redirectToLogin">登录</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  bookId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['review-added'])
const router = useRouter()

const rating = ref(0)
const hoverRating = ref(0)
const comment = ref('')
const submitting = ref(false)
const submitMessage = ref('')
const submitStatus = ref('')
const showError = ref(false)
const isLoggedIn = ref(false)

// 判断登录状态
const checkLogin = () => {
  isLoggedIn.value = !!localStorage.getItem('token')
}

// 提交评论
const submitReview = async () => {
  showError.value = true
  submitMessage.value = ''

  if (!rating.value) {
    submitMessage.value = '请选择评分'
    submitStatus.value = 'error'
    return
  }

  if (!comment.value.trim()) {
    return
  }

  try {
    submitting.value = true

    const response = await fetch(`/api/reviews/book?bookId=${props.bookId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        rating: rating.value,
        comment: comment.value.trim()
      })
    })

    const data = await response.json()

    if (response.ok && data.state === 'success') {
      submitMessage.value = '评论已提交'
      submitStatus.value = 'success'
      rating.value = 0
      comment.value = ''
      showError.value = false
      emit('review-added')
    } else {
      submitMessage.value = data.message || '评论提交失败'
      submitStatus.value = 'error'
    }
  } catch (error) {
    console.error('提交评论失败:', error)
    submitMessage.value = '提交失败，请稍后重试'
    submitStatus.value = 'error'
  } finally {
    submitting.value = false
  }
}

// 登录跳转
const redirectToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  checkLogin()
})
</script>

<style scoped>
.review-form-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  padding: 25px;
  margin: 30px 0;
}

.form-title {
  color: #333;
  font-size: 22px;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 评分部分 */
.rating-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-label {
  font-weight: 500;
  color: #555;
  margin: 0;
}

.star-rating {
  display: flex;
  gap: 8px;
}

.star-rating i {
  font-size: 26px;
  color: #ffd700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.star-rating i:hover {
  transform: scale(1.2);
}

.rating-value {
  font-weight: bold;
  color: #666;
  margin-left: 5px;
}

/* 评论部分 */
.comment-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-label {
  font-weight: 500;
  color: #555;
}

textarea {
  width: 100%;
  min-height: 120px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  font-size: 14px;
  transition: all 0.3s ease;
}

textarea:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

textarea.error {
  border-color: #ff6b6b;
  background-color: #fff8f8;
}

.error-message {
  color: #ff6b6b;
  font-size: 14px;
  margin: 5px 0 0 0;
}

/* 提交按钮 */
.submit-section {
  margin-top: 5px;
}

.submit-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 25px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-button:hover:not(:disabled) {
  background-color: #357abd;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 提交结果消息 */
.submit-message {
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
  transition: all 0.3s ease;
}

.submit-message.success {
  background-color: #e7f7ed;
  color: #2a9d60;
  border: 1px solid #c3e6d1;
}

.submit-message.error {
  background-color: #fee8e7;
  color: #e74c3c;
  border: 1px solid #f9c9c7;
}

/* 登录提示 */
.login-prompt {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 25px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.login-prompt p {
  color: #666;
  margin: 0;
}

.login-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-button:hover {
  background-color: #357abd;
  transform: translateY(-2px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .review-form-container {
    padding: 20px;
  }

  .rating-section {
    flex-wrap: wrap;
  }
}
</style>
