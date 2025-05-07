/**
 * Toast notification composable API
 */

import { ref } from 'vue';

// Create a global state to manage toast messages
const toasts = ref([]);

/**
 * Display toast notification message
 * @param {string} message Message content
 * @param {string} type Message type 'info' | 'success' | 'error' | 'warning'
 * @param {number} duration Display duration (milliseconds)
 */
export function useToast() {
  /**
   * Display a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Toast type ('success', 'error', 'info', 'warning')
   * @param {number} duration - Display duration (milliseconds)
   */
  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();

    // Add new toast to the array
    toasts.value.push({
      id,
      message,
      type,
      show: true
    });

    // Set timer to automatically close the toast
    setTimeout(() => {
      // Find the corresponding toast and mark it as closed
      const index = toasts.value.findIndex(toast => toast.id === id);
      if (index !== -1) {
        toasts.value[index].show = false;

        // Give the animation some time, then remove from array
        setTimeout(() => {
          toasts.value = toasts.value.filter(toast => toast.id !== id);
        }, 300);
      }
    }, duration);
  };

  return {
    toasts,
    showToast
  };
}

// Default export of singleton toast service
export default useToast();
