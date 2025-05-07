<template>
  <div class="relative">
    <!-- Main button -->
    <button
      @click="toggleWishlist"
      :disabled="loading"
      :class="[
        'inline-flex items-center justify-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
        isInWishlist
          ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200',
        loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
      ]"
    >
      <!-- Button icon -->
      <template v-if="loading">
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </template>
      <template v-else-if="isInWishlist">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3c3.08 0 5.5 2.42 5.5 5.5 0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </template>
      <template v-else>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 010 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </template>

      <!-- Button text -->
      {{ isInWishlist ? 'Remove from wishlist' : 'Add to wishlist' }}
    </button>

    <!-- Notification bubble -->
    <transition name="fade">
      <div
        v-if="notification.show"
        :class="[
          'absolute right-0 top-full mt-2 w-48 p-2 rounded-md shadow-lg text-xs text-center z-10',
          notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        ]"
      >
        {{ notification.message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
// Import Vue APIs
import { ref, onMounted } from 'vue';
// Import API interfaces
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlist';
// Import development mock
import { mockWishlistAPI } from '../mock-api.js';

// Receive props from parent component
const props = defineProps({
  bookId: {
    type: [String, Number],
    required: true
  },
  initialState: {
    type: Boolean,
    default: undefined
  }
});

// Emit events to parent component
const emit = defineEmits(['update:wishlist']);

// Component internal state
const loading = ref(false);
const isInWishlist = ref(false);
const notification = ref({
  show: false,
  message: '',
  type: 'success'
});

// Determine if in mock development environment
const isMockMode = () => import.meta.env.MODE === 'development' && window.mockMode;

// Initialize on component mount
onMounted(() => {
  checkWishlistStatus();
});

/**
 * Check if current book is in wishlist
 */
const checkWishlistStatus = async () => {
  if (props.initialState !== undefined) {
    // Use initial state if provided
    isInWishlist.value = props.initialState;
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) return;

  loading.value = true;
  try {
    const response = isMockMode() ? mockWishlistAPI.getWishlist() : await getWishlist();
    const bookIds = response?.bookId?.map(id => String(id)) || [];
    isInWishlist.value = bookIds.includes(String(props.bookId));
  } catch (error) {
    console.error('Failed to check wishlist status:', error);
    showNotification('Failed to load wishlist', 'error');
  } finally {
    loading.value = false;
  }
};

/**
 * Toggle wishlist status (add or remove)
 */
const toggleWishlist = async () => {
  if (loading.value) return;

  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Please login first', 'error');
    return;
  }

  loading.value = true;
  try {
    if (isMockMode()) {
      // Mock mode
      isInWishlist.value
        ? mockWishlistAPI.removeFromWishlist([props.bookId])
        : mockWishlistAPI.addToWishlist(props.bookId);
    } else {
      // Official API
      isInWishlist.value
        ? await removeFromWishlist(props.bookId)
        : await addToWishlist(props.bookId);
    }

    // Update state
    isInWishlist.value = !isInWishlist.value;
    showNotification(isInWishlist.value ? 'Added to wishlist' : 'Removed from wishlist', 'success');

    // Trigger custom event to notify Header component to update wishlist count
    document.dispatchEvent(new CustomEvent('wishlist-updated'));

    // Notify parent component
    emit('update:wishlist', {
      bookId: props.bookId,
      inWishlist: isInWishlist.value
    });
  } catch (error) {
    console.error('Failed to operate wishlist:', error);
    showNotification('Operation failed, please try again later', 'error');
  } finally {
    loading.value = false;
  }
};

/**
 * Show notification bubble
 */
const showNotification = (message, type = 'success') => {
  notification.value = { show: true, message, type };
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};
</script>

<style scoped>
/* Enter/leave animation */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
