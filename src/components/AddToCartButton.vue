<template>
  <button
    class="add-to-cart-btn"
    :class="{ 'loading': isLoading, 'success': showSuccess }"
    @click="handleAddToCart"
    :disabled="isLoading || showSuccess"
  >
    <i v-if="showSuccess" class="ri-check-line"></i>
    <i v-else-if="isLoading" class="ri-loader-4-line loading-icon"></i>
    <i v-else class="ri-shopping-cart-line"></i>
    {{ computedButtonText }}
  </button>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { addToCart } from '../api/cart.ts';
import { useToast } from '../composables/useToast';

const props = defineProps({
  bookId: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    default: 'Add to cart'
  }
});

const isLoading = ref(false);
const showSuccess = ref(false);
const { showToast } = useToast();
const SUCCESS_RESET_DELAY = 3000;

onMounted(() => {
  if (import.meta.env.MODE === 'development' && !props.bookId) {
    console.warn('AddToCartButton: Book ID is empty');
  }
});

const computedButtonText = computed(() => {
  if (showSuccess.value) return 'Added to cart';
  if (isLoading.value) return 'Adding...';
  return props.buttonText;
});

const handleAddToCart = async (event) => {
  event?.stopPropagation?.();

  if (isLoading.value || showSuccess.value) return;

  if (!props.bookId) {
    showToast('Failed to add to cart: Invalid book ID', 'error');
    return;
  }

  isLoading.value = true;

  try {
    const result = await addToCart(props.bookId);

    if (result?.state === 'success') {
      showSuccess.value = true;
      showToast('success', 'success');

      updateLocalCart(props.bookId);

      setTimeout(() => {
        showSuccess.value = false;
      }, SUCCESS_RESET_DELAY);
    } else {
      showToast(result?.state || 'Failed to add to cart', 'warning');
    }
  } catch (error) {
    console.error('Failed to add to cart:', error);
    showToast(error.message || 'Failed to add to cart', 'error');
  } finally {
    isLoading.value = false;
  }
};

function updateLocalCart(bookId) {
  try {
    const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
    const exists = localCart.some(item => item.bookId === bookId || item.id === bookId);

    if (!exists) {
      const bookCacheKey = `book_${bookId}`;
      const currentBook = localStorage.getItem(bookCacheKey);

      const bookData = currentBook ? JSON.parse(currentBook) : { bookId };
      localCart.push(bookData);

      localStorage.setItem('cartItems', JSON.stringify(localCart));
    }
  } catch (error) {
    console.error('Failed to update local cart:', error);
  }
}
</script>

<style scoped>
.add-to-cart-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: #e9a84c;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  height: 100%;
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: #d89b3f;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.add-to-cart-btn:active:not(:disabled) {
  transform: translateY(0);
}

.add-to-cart-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.add-to-cart-btn.loading {
  background-color: #f0b561;
}

.add-to-cart-btn.success {
  background-color: #4caf50;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
