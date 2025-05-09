import axios from 'axios';

// Get wishlist
export const getWishlist = async () => {
  try {
    const response = await axios.post('/api/wishlist/get');
    return response.data;
  } catch (error) {
    console.error('Get wishlist failed:', error);
    throw error;
  }
};

// Get book details
export const getBookDetail = async (bookId: string) => {
  try {
    const response = await axios.get(`/api/books/get?bookId=${bookId}`);
    return response.data;
  } catch (error) {
    console.error('Get book details failed:', error);
    throw error;
  }
};

// Remove book from wishlist
export const removeFromWishlist = async (bookId: string) => {
  try {
    const response = await axios.post('/api/wishlist/delete', { bookId });
    return response.data;
  } catch (error) {
    console.error('Remove book from wishlist failed:', error);
    throw error;
  }
};
