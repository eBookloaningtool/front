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

// Load comments
const loadComments = async () => {
  if (!props.bookId) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await getBookReviews(props.bookId);
    comments.value = response.comments || [];
  } catch (err) {
    console.error('Failed to get comments:', err);
    error.value = 'Error loading comments. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// Watch for bookId changes to reload comments
watch(() => props.bookId, (newVal) => {
  if (newVal) {
    loadComments();
  }
});

// Load comments when component is mounted
onMounted(() => {
  loadComments();
});

// Format rating display
const formatRating = (rating) => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
};
</script>

<template>
  <div class="review-list-container space-y-4">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Reader Reviews</h2>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
    </div>

    <!-- Error message -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg text-center">
      {{ error }}
    </div>

    <!-- No comments message -->
    <div v-else-if="comments.length === 0" class="text-center py-8 text-gray-500">
      No reviews yet. Be the first to review!
    </div>

    <!-- Comments list -->
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
            {{ comment.date || 'Unknown date' }}
          </div>
        </div>
        <div class="mt-2 text-sm text-gray-500">
          Reviewer: {{ comment.userName || 'Anonymous User' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-list-container {
  animation: fadeIn 0.5s ease-out;
  background-color: #fffbf0;
  padding: 1.5rem;
  border-radius: 0.5rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
