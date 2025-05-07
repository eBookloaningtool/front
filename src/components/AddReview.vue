<template>
  <div class="add-review-container">
    <h3 class="title">Leave a comment</h3>

    <!-- Success message -->
    <p v-if="success" class="alert-success">Comment published successfully!</p>

    <!-- Error message -->
    <p v-if="error" class="alert-error">{{ error }}</p>

    <!-- Comment form -->
    <form @submit.prevent="submitReview" class="space-y-4">

      <!-- Rating selection -->
      <div>
        <label class="label">Rating</label>
        <div class="flex gap-2">
          <button
            v-for="option in ratingOptions"
            :key="option"
            type="button"
            class="rating-star"
            :class="{ 'active': rating >= option }"
            @click="rating = option"
            :aria-pressed="rating >= option"
            :aria-label="`Select ${option} star`"
          >
            ★
          </button>
        </div>
      </div>

      <!-- Comment input -->
      <div>
        <label for="comment" class="label">Comment</label>
        <textarea
          id="comment"
          v-model.trim="comment"
          class="textarea"
          placeholder="Share your thoughts on this book..."
          :aria-invalid="!isCommentValid"
        ></textarea>
      </div>

      <!-- Submit button -->
      <div>
        <button
          type="submit"
          class="btn-submit"
          :disabled="!canSubmit || submitting"
        >
          <template v-if="submitting">
            <svg class="icon-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Submitting...
          </template>
          <template v-else>
            Submit Comment
          </template>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { addReview } from '@/api/reviews.ts';

const props = defineProps({
  bookId: { type: String, required: true }
});
const emit = defineEmits(['review-added']);

const rating = ref(5);
const comment = ref('');
const submitting = ref(false);
const error = ref('');
const success = ref(false);

// Rating options
const ratingOptions = [1, 2, 3, 4, 5];

// Validation
const isCommentValid = computed(() => comment.value.length > 0);

// Check if can submit
const canSubmit = computed(() => rating.value > 0 && isCommentValid.value);

// Submit review
const submitReview = async () => {
  if (!canSubmit.value || submitting.value) return;

  submitting.value = true;
  error.value = '';
  success.value = false;

  try {
    const payload = {
      bookId: props.bookId,
      rating: rating.value,
      comment: comment.value
    };

    const response = await addReview(payload);

    if (response.state === 'success') {
      success.value = true;
      comment.value = '';
      rating.value = 5;
      emit('review-added');

      setTimeout(() => success.value = false, 3000);
    } else {
      error.value = 'Submission failed, please try again later';
    }
  } catch (err) {
    console.error('Submission failed:', err);
    error.value = 'Network error, please try again later';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.add-review-container {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.label {
  font-size: 0.875rem;
  color: #555;
  margin-bottom: 0.5rem;
}

.textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  resize: vertical;
  min-height: 100px;
  font-size: 0.9rem;
}

.rating-star {
  font-size: 1.5rem;
  color: #ccc;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.rating-star.active {
  color: #f59e0b;
}

.btn-submit {
  width: 100%;
  background: #6366f1;
  color: white;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 0.5rem;
  transition: background 0.2s;
  cursor: pointer;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-submit:hover:not(:disabled) {
  background: #4f46e5;
}

.alert-success {
  background: #ecfdf5;
  color: #10b981;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.alert-error {
  background: #fef2f2;
  color: #ef4444;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.icon-spin {
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
