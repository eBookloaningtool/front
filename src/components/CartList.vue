<template>
  <div class="cart-list">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading cart...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="ri-error-warning-line"></i>
      <p>{{ error }}</p>
      <button @click="fetchCartItems" class="retry-btn">Retry</button>
    </div>

    <div v-else-if="cartItems.length === 0" class="empty-state">
      <i class="ri-shopping-cart-line"></i>
      <p>Your cart is empty</p>
      <slot name="empty-action"></slot>
    </div>

    <template v-else>
      <div class="cart-items">
        <ShoppingCartItem
          v-for="item in cartItems"
          :key="item.bookId"
          :item="item"
          @update:quantity="updateQuantity"
          @remove="handleRemoveItem"
        />
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>Total: {{ cartItems.length }} books</span>
          <span class="total-price">£{{ totalPrice.toFixed(2) }}</span>
        </div>
        <slot name="cart-actions"></slot>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { cartAPI, bookAPI } from '../services/api';
import { useToast } from '../composables/useToast';
import ShoppingCartItem from './ShoppingCartItem.vue';

const props = defineProps({
  autoLoad: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:cartItems', 'cart-updated']);

const cartItems = ref([]);
const isLoading = ref(false);
const error = ref(null);
const removingItems = ref(new Set());
const { showToast } = useToast();
const total = ref(0);

// Calculate total price
const totalPrice = computed(() => {
  return total.value;
});

const fetchCartItems = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    // First get cart data from API
    const response = await cartAPI.getCart();
    console.log('API cart data:', response);

    if (response.data && response.data.bookId && response.data.bookId.length > 0) {
      // Get details for each book
      const bookDetails = await Promise.all(
        response.data.bookId.map(async (bookId) => {
          try {
            const bookResponse = await bookAPI.getBookDetail(bookId);
            return {
              bookId: bookId,
              title: bookResponse.data.title,
              author: bookResponse.data.author,
              price: bookResponse.data.price,
              coverUrl: bookResponse.data.coverUrl,
              quantity: 1
            };
          } catch (err) {
            console.error(`Failed to get book ${bookId} details:`, err);
            return null;
          }
        })
      );

      // Filter out books with failed fetch
      cartItems.value = bookDetails.filter(Boolean);
      console.log('Updated cartItems:', cartItems.value);

      // Update local storage
      const storageData = response.data.bookId.map(id => ({ bookId: id }));
      console.log('Updating localStorage data:', storageData);
      localStorage.setItem('cartItems', JSON.stringify(storageData));

      // Notify parent component
      emit('update:cartItems', cartItems.value);
      emit('cart-updated', cartItems.value);

      // Trigger custom event to notify Header component to update cart icon
      document.dispatchEvent(new CustomEvent('cart-updated'));
    } else {
      cartItems.value = [];
      // Clear local storage
      localStorage.removeItem('cartItems');
      // Notify parent component
      emit('update:cartItems', []);
      emit('cart-updated', []);

      // Trigger custom event to notify Header component to update cart icon
      document.dispatchEvent(new CustomEvent('cart-updated'));
    }
    calculateTotal();
  } catch (err) {
    console.error('Failed to get cart:', err);
    error.value = 'Failed to retrieve shopping cart, please try again later';
  } finally {
    isLoading.value = false;
  }
};

const calculateTotal = () => {
  total.value = cartItems.value.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
};

const updateQuantity = async (itemId, newQuantity) => {
  try {
    await cartAPI.updateCartItem(itemId, newQuantity);
    await fetchCartItems();
  } catch (err) {
    console.error('Failed to update cart:', err);
    error.value = 'Update shopping cart failed, please try again later';
  }
};

const removeItem = async (itemId) => {
  console.log('Starting to remove item, itemId:', itemId);
  try {
    await cartAPI.removeFromCart(itemId);
    console.log('Remove item API call successful');
    await fetchCartItems();
    console.log('Cart data refreshed');
  } catch (err) {
    console.error('Failed to remove cart item:', err);
    error.value = 'Failed to remove shopping cart item, please try again later';
    throw err; // Throw error for parent handling
  }
};

// Remove item from cart
const handleRemoveItem = async (bookId) => {
  console.log('handleRemoveItem called, bookId:', bookId);
  if (!bookId || removingItems.value.has(bookId)) {
    console.log('Removal prevented, reason:', !bookId ? 'bookId is empty' : 'item is being removed');
    return;
  }

  removingItems.value.add(bookId);
  console.log('Current items being removed:', Array.from(removingItems.value));

  try {
    await removeItem(bookId);
    await fetchCartItems();
    showToast('Item removed from cart', 'success');
    // Trigger custom event to notify Header component to update cart icon
    document.dispatchEvent(new CustomEvent('cart-updated'));
  } catch (err) {
    console.error('Error removing cart item:', err);
    showToast('Failed to remove item, please try again', 'error');
  } finally {
    removingItems.value.delete(bookId);
    console.log('Removal complete, current items being removed:', Array.from(removingItems.value));
  }
};

// Auto-load cart data
onMounted(() => {
  if (props.autoLoad) {
    fetchCartItems();
  }
});

// Expose methods for parent component
defineExpose({
  fetchCartItems,
  removeItem: handleRemoveItem
});
</script>

<style scoped>
.cart-list {
  width: 100%;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  padding: 30px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(233, 168, 76, 0.2);
  border-radius: 50%;
  border-top-color: #e9a84c;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state i,
.empty-state i {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 15px;
}

.error-state {
  color: #f44336;
}

.error-state i {
  color: #f44336;
}

.retry-btn {
  margin-top: 15px;
  background-color: #e9a84c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}

.cart-items {
  margin-bottom: 20px;
}

.cart-summary {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  margin-bottom: 10px;
}

.total-price {
  font-size: 20px;
  font-weight: 600;
  color: #e9a84c;
}
</style>
