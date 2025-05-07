<!-- CommentSection.vue -->
<template>
  <div class="comment-section">
    <h2 class="section-title">User Reviews</h2>
    <div class="comment-form" v-if="isLoggedIn">
      <h3>Post a Review</h3>
      <div class="rating-input">
        <span>Rating:</span>
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
                placeholder="Write your review..."
                @input="validateComment">
      </textarea>
      <button class="submit-comment"
              :disabled="!isValid"
              @click="submitComment">
        Submit Review
      </button>
    </div>

    <div v-else class="login-prompt">
      <p>Please login to post a review</p>
      <button class="login-btn" @click="redirectToLogin">Login</button>
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
        <p>No reviews yet. Be the first to review!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast';

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
const error = ref(null)
const isLoading = ref(false)
const { showToast } = useToast()
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
  if (!dateString) return 'Unknown date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const submitComment = async () => {
  if (!isValid.value) return

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      error.value = 'Please login to post a review'
      return
    }

    const response = await fetch('https://api.borrowbee.wcy.one:61700/api/reviews/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bookId: props.bookId,
        rating: currentRating.value,
        comment: commentText.value.trim()
      })
    })
    const result = await response.json()
    if (result.state === 'success') {
      showToast('success', 'success')
      // Reload comments after successful submission
      await loadComments()
      commentText.value = ''
      currentRating.value = 0
      isValid.value = false
    } else {
      showToast(result.state || 'Failed to add comment', 'error')
    }
  } catch (error) {
    console.error('Failed to add comment:', error)
    showToast('Failed to add comment', 'error')
    error.value = error.message
  }
}

const loadComments = async () => {
  console.log('Loading comments for bookId:', props.bookId)
  isLoading.value = true
  try {
    // Get comment ID list
    const response = await fetch(`https://api.borrowbee.wcy.one:61700/api/reviews/book?bookId=${props.bookId}`)
    console.log('Comment ID list response:', response)

    if (!response.ok) {
      throw new Error('Failed to get comments')
    }

    const data = await response.json()
    console.log('Comment ID list data:', data)
    const commentIds = data.commentIds || []

    // Get detailed content for each comment
    const commentPromises = commentIds.map(async (commentId) => {
      try {
        console.log('Getting comment content for commentId:', commentId)
        const commentResponse = await fetch(`https://api.borrowbee.wcy.one:61700/api/reviews/content?commentId=${commentId}`)
        if (!commentResponse.ok) {
          console.error(`Failed to get comment ${commentId}`)
          return null
        }
        const commentData = await commentResponse.json()
        console.log('Comment data:', commentData)
        console.log('Comment content:', commentData.comment)
        const comment = {
          id: commentData.uuid,
          rating: commentData.rating,
          content: commentData.content,
          username: commentData.username,
          bookId: commentData.bookId,
          createdAt: commentData.createDate
        }
        console.log('Processed comment object:', comment)
        return comment
      } catch (err) {
        console.error(`Error processing comment ${commentId}:`, err)
        return null
      }
    })

    const commentResults = await Promise.all(commentPromises)
    comments.value = commentResults.filter(comment => comment !== null)
    console.log('Final comments list:', comments.value)
  } catch (error) {
    console.error('Failed to load comments:', error)
    error.value = error.message
  } finally {
    isLoading.value = false
  }
}

// Watch for bookId changes
watch(() => props.bookId, (newVal) => {
  console.log('bookId changed:', newVal)
  if (newVal) {
    loadComments()
  }
})

onMounted(() => {
  console.log('Component mounted, current bookId:', props.bookId)
  isLoggedIn.value = !!localStorage.getItem('token')
  if (props.bookId) {
    loadComments()
  }
})
</script>

<style scoped>
.comment-section {
  margin: 40px 0;
  background-color: #fffbf0;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.comment-form h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
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
  background-color: #ffffff;
}

textarea:focus {
  border-color: #f0ad4e;
  outline: none;
}

.submit-comment {
  background-color: #3498db;
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
  background-color: #2980b9;
  transform: translateY(-2px);
}

.submit-comment:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-prompt {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.login-prompt p {
  margin-bottom: 15px;
  color: #666;
}

.login-btn {
  background-color: #3498db;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.login-btn:hover {
  background-color: #2980b9;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
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

/* Responsive design */
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
