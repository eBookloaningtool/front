<template>
  <div class="book-comments-container">
    <h2 class="comments-title">User Reviews</h2>

    <div v-if="isLoading" class="loading-comments">
      <div class="loading-spinner"></div>
      <p>Loading reviews...</p>
    </div>

    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchComments" class="retry-button">Retry</button>
    </div>

    <div v-else-if="comments.length === 0" class="no-comments">
      <p>This book has no reviews yet. Be the first to review!</p>
    </div>

    <div v-else class="comments-list">
      <div v-for="(commentId, index) in comments" :key="commentId"
           class="comment-item" :class="{'comment-item-alt': index % 2 === 1}">
        <div class="comment-header">
          <div class="comment-avatar">
            <span>{{ getAvatarText(commentId) }}</span>
          </div>
          <div class="comment-meta">
            <p class="comment-id">Review ID: {{ commentId }}</p>
            <p class="comment-date">{{ generateRandomDate() }}</p>
          </div>
        </div>
        <div class="comment-content">
          <p>This will display the review content. Currently showing review ID: {{ commentId }}</p>
        </div>
        <div class="comment-rating">
          <span v-for="n in 5" :key="n" class="star" :class="{ 'filled': n <= getRandomRating(commentId) }">★</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookComments',
  props: {
    bookId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      comments: [],
      isLoading: true,
      error: null,
      // Cache for simulating consistent random ratings
      ratingCache: {}
    }
  },
  mounted() {
    this.fetchComments();
  },
  methods: {
    async fetchComments() {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await fetch(`/api/reviews/book?bookId=${this.bookId}`);

        if (!response.ok) {
          throw new Error('Failed to get reviews');
        }

        const data = await response.json();
        this.comments = data.comments || [];
      } catch (error) {
        console.error('Error fetching reviews:', error);
        this.error = 'Unable to load reviews. Please try again later.';
      } finally {
        this.isLoading = false;
      }
    },

    // Generate avatar text from comment ID
    getAvatarText(commentId) {
      // Use the first two characters of the comment ID as avatar text
      return commentId.substring(0, 2).toUpperCase();
    },

    // Generate consistent random rating (1-5) based on comment ID
    getRandomRating(commentId) {
      if (!this.ratingCache[commentId]) {
        // Generate consistent random number based on comment ID
        const hash = commentId.split('').reduce((acc, char) => {
          return char.charCodeAt(0) + acc;
        }, 0);
        this.ratingCache[commentId] = (hash % 5) + 1; // Number between 1 and 5
      }
      return this.ratingCache[commentId];
    },

    // Generate random date (within the past 30 days)
    generateRandomDate() {
      const today = new Date();
      const daysAgo = Math.floor(Math.random() * 30);
      const randomDate = new Date(today);
      randomDate.setDate(today.getDate() - daysAgo);

      return randomDate.toLocaleDateString('en-US');
    }
  }
}
</script>

<style scoped>
.book-comments-container {
  margin: 30px 0;
  padding: 20px;
  background-color: #fffbf0;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.comments-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eaeaea;
}

.loading-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  text-align: center;
  color: #e74c3c;
  padding: 20px;
}

.retry-button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #2980b9;
}

.no-comments {
  text-align: center;
  padding: 30px;
  color: #777;
  font-style: italic;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.comment-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.comment-item-alt {
  background-color: #f9f9f9;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
}

.comment-meta {
  flex: 1;
}

.comment-id {
  font-size: 14px;
  color: #777;
  margin: 0;
}

.comment-date {
  font-size: 12px;
  color: #999;
  margin: 4px 0 0 0;
}

.comment-content {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #444;
}

.comment-rating {
  text-align: right;
}

.star {
  color: #ddd;
  font-size: 20px;
  margin-right: 2px;
}

.star.filled {
  color: #f1c40f;
}

@media (max-width: 768px) {
  .book-comments-container {
    padding: 15px;
  }

  .comment-item {
    padding: 15px;
  }
}
</style>