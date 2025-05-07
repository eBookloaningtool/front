<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-800">My Wishlist</h1>
          <p class="text-gray-500 mt-1">Manage your saved books</p>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-4">
            <p class="text-gray-500">Loading...</p>
          </div>
          <div v-else-if="wishlistItems.length === 0" class="text-center py-8">
            <p class="text-gray-500">Your wishlist is empty</p>
            <RouterLink
              to="/"
              class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Browse Library
            </RouterLink>
          </div>
          <div v-else>
            <WishlistComponent
              :items="wishlistItems"
              @remove-item="removeFromWishlist"
              @view-details="viewBookDetails"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import WishlistComponent from '../../components/Wishlist.vue';

// Get router instance
const router = useRouter();

// Reactive state
const wishlistItems = ref([]);
const loading = ref(true);

// Mock fetch wishlist data
onMounted(async () => {
  try {
    // This should be an API call, using mock data for now
    await new Promise(resolve => setTimeout(resolve, 500));
    wishlistItems.value = [
      {
        id: 1,
        title: 'The Three-Body Problem',
        author: 'Liu Cixin',
        cover: '/images/books/threebody.jpg',
        price: '49.00'
      },
      {
        id: 2,
        title: 'One Hundred Years of Solitude',
        author: 'Gabriel García Márquez',
        cover: '/images/books/solitude.jpg',
        price: '42.50'
      }
    ];
  } catch (error) {
    console.error('Failed to fetch wishlist:', error);
  } finally {
    loading.value = false;
  }
});

// Remove book from wishlist
const removeFromWishlist = (bookId) => {
  wishlistItems.value = wishlistItems.value.filter(item => item.id !== bookId);
  // There should be an API call here to sync with server data
};

// View book details - page navigation
const viewBookDetails = (bookId) => {
  router.push(`/books/${bookId}`);
};
</script>
