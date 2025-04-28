<template>
  <div class="book-comments-container">
    <h2 class="comments-title">用户评论</h2>
    
    <div v-if="isLoading" class="loading-comments">
      <div class="loading-spinner"></div>
      <p>加载评论中...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      <p>{{ error }}</p>
      <button @click="fetchComments" class="retry-button">重试</button>
    </div>
    
    <div v-else-if="comments.length === 0" class="no-comments">
      <p>这本书还没有评论，成为第一个评论的人吧！</p>
    </div>
    
    <div v-else class="comments-list">
      <div v-for="(commentId, index) in comments" :key="commentId" 
           class="comment-item" :class="{'comment-item-alt': index % 2 === 1}">
        <div class="comment-header">
          <div class="comment-avatar">
            <span>{{ getAvatarText(commentId) }}</span>
          </div>
          <div class="comment-meta">
            <p class="comment-id">评论 ID: {{ commentId }}</p>
            <p class="comment-date">{{ generateRandomDate() }}</p>
          </div>
        </div>
        <div class="comment-content">
          <p>这里将来会显示评论内容。目前仅显示评论ID：{{ commentId }}</p>
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
      // 用于模拟随机评分的缓存
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
        const response = await fetch(`/api/books/${this.bookId}/reviews`);
        
        if (!response.ok) {
          throw new Error('获取评论失败');
        }
        
        const data = await response.json();
        this.comments = data.comments || [];
      } catch (error) {
        console.error('获取评论出错:', error);
        this.error = '无法加载评论，请稍后重试';
      } finally {
        this.isLoading = false;
      }
    },
    
    // 从评论ID生成头像文本
    getAvatarText(commentId) {
      // 使用评论ID的前两个字符作为头像文本
      return commentId.substring(0, 2).toUpperCase();
    },
    
    // 根据评论ID生成一致的随机评分（1-5）
    getRandomRating(commentId) {
      if (!this.ratingCache[commentId]) {
        // 基于commentId生成一个一致的随机数
        const hash = commentId.split('').reduce((acc, char) => {
          return char.charCodeAt(0) + acc;
        }, 0);
        this.ratingCache[commentId] = (hash % 5) + 1; // 1到5之间的数字
      }
      return this.ratingCache[commentId];
    },
    
    // 生成随机日期（过去30天内）
    generateRandomDate() {
      const today = new Date();
      const daysAgo = Math.floor(Math.random() * 30);
      const randomDate = new Date(today);
      randomDate.setDate(today.getDate() - daysAgo);
      
      return randomDate.toLocaleDateString('zh-CN');
    }
  }
}
</script>

<style scoped>
.book-comments-container {
  margin: 30px 0;
  padding: 20px;
  background-color: #f9f9f9;
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
  background-color: #f5f5f5;
  border-radius: 8px;
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
  background-color: #f5f7fa;
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