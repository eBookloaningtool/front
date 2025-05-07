import axios from 'axios';

// User related APIs
export const userAPI = {
  // User registration
  register: (data) => axios.post('/api/users/register', data),

  // User login
  login: (data) => axios.post('/api/auth/login', data),

  // User logout
  logout: () => axios.post('/api/auth/logout'),

  // Get user information
  getUserInfo: () => axios.post('/api/users/info'),

  // Update user information
  updateUserInfo: (data) => axios.post('/api/users/update', data),

  // Delete account
  deleteAccount: () => axios.post('/api/users/delete'),

  // Forgot password
  forgetPassword: (data) => axios.post('/api/auth/forget', data)
};

// Book related APIs
export const bookAPI = {
  // Get popular books list
  getPopularBooks: () => {
    return axios.get('/api/books/popular');
  },

  // Get book details
  getBookDetail: (bookId) => {
    return axios.get(`/api/books/get?bookId=${bookId}`);
  },

  // Get book content
  getBookContent: (bookId) => {
    return axios.post('/api/books/content', { bookId });
  },

  // Search books
  searchBooks: (params) => {
    const { title, author, category } = params;
    const queryParams = new URLSearchParams();
    if (title) queryParams.append('title', title);
    if (author) queryParams.append('author', author);
    if (category) queryParams.append('category', category);
    return axios.get(`/api/books/search?${queryParams.toString()}`);
  },

  // Get all books
  getAllBooks: () => {
    return axios.get('/api/books/popular');
  },

  // Get books by category
  getBooksByCategory: (categoryId) => {
    return axios.get(`/api/books?categoryId=${categoryId}`);
  }
};

// Category related APIs
export const categoryAPI = {
  // Get all categories
  getAllCategories: () => axios.get('/api/categories/getAll'),

  // Get category details
  getCategoryDetail: (categoryId) => axios.get(`/api/categories/${categoryId}`),

  // Get categories with books
  getCategoriesWithBooks: () => axios.get('/api/categories/getAll')
};

// Borrow related APIs
export const borrowAPI = {
  // Borrow books
  borrowBooks: (bookIds) => axios.post('/api/borrow', { bookIds }),

  // Return book
  returnBook: (bookId) => axios.post(`/api/borrow/${bookId}/return`),

  // Renew book
  renewBook: (bookId) => axios.post(`/api/borrow/${bookId}/renew`),

  // Get borrow list
  getBorrowList: () => axios.get('/api/borrow'),

  // Get borrow history
  getBorrowHistory: () => axios.get('/api/borrow/history')
};

// Wishlist related APIs
export const wishlistAPI = {
  // Add to wishlist
  addToWishlist: (bookId) => axios.post('/api/wishlist', { bookId }),

  // Remove from wishlist
  removeFromWishlist: (bookId) => axios.delete(`/api/wishlist/${bookId}`),

  // Get wishlist
  getWishlist: () => axios.get('/api/wishlist')
};

// Cart related APIs
export const cartAPI = {
  // Add to cart
  addToCart: async (bookId) => {
    const response = await axios.post('/api/cart/add', { bookId }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    // Trigger custom event to notify Header component to update cart icon after successful addition
    if (response.data && response.data.state === 'success') {
      document.dispatchEvent(new CustomEvent('cart-updated'));
    }

    return response;
  },

  // Remove from cart
  removeFromCart: (bookId) => axios.post('/api/cart/remove', { bookId: Array.isArray(bookId) ? bookId : [bookId] }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }),

  // Update cart item quantity
  updateCartItem: (bookId, quantity) => axios.put(`/api/cart/${bookId}`, { quantity }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }),

  // Get cart
  getCart: () => axios.post('/api/cart/get', {}, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }),

  // Clear cart
  clearCart: async () => {
    try {
      // First get all book IDs in the current cart
      const response = await cartAPI.getCart();
      if (response.data && response.data.bookId && response.data.bookId.length > 0) {
        // Use remove API to delete all books
        return await cartAPI.removeFromCart(response.data.bookId);
      }
      return { state: 'success' };
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  }
};

// Review related APIs
export const reviewAPI = {
  // Add review
  addReview: (data) => axios.post('/api/reviews', data),

  // Get user reviews
  getUserReviews: () => axios.get('/api/reviews/user'),

  // Get book reviews
  getBookReviews: (bookId) => axios.get(`/api/reviews/book/${bookId}`),

  // Get review details
  getReviewDetail: (reviewId) => axios.get(`/api/reviews/${reviewId}`),

  // Delete review
  deleteReview: (reviewId) => axios.delete(`/api/reviews/${reviewId}`)
};

// Payment related APIs
export const paymentAPI = {
  // Create payment order
  createOrder: (data) => axios.post('/api/payments/orders', data),

  // Get order details
  getOrderDetail: (orderId) => axios.get(`/api/payments/orders/${orderId}`),

  // Pay order
  payOrder: (orderId, data) => axios.post(`/api/payments/orders/${orderId}/pay`, data),

  // Get payment history
  getPaymentHistory: () => axios.get('/api/payments/history')
};
