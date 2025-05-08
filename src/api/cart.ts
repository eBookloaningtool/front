/**
 * Shopping cart related interfaces
 */
import { post } from '../utils/request';
import axios from 'axios';

// Interface type definition
interface CartSuccessResponse {
  state: string;
  message?: string;
}

interface CartItemsResponse {
  bookId: string[];
}

// Interface address enumeration
const URL = {
  ADD: '/api/cart/add',
  GET: '/api/cart/get',
  REMOVE: '/api/cart/remove',
  CLEAR: '/api/cart/clear'
};

/**
 * Add book to cart
 * @param {string} bookId Book ID
 * @returns {Promise<CartSuccessResponse>} Response result
 */
export async function addToCart(bookId: string): Promise<CartSuccessResponse> {
  // Validate bookId validity
  if (!bookId) {
    console.error('addToCart: Invalid bookId provided', bookId);
    return { state: 'error', message: 'Invalid book ID' };
  }

  try {
    console.log(`Adding book (${bookId}) to cart...`);

    // Send request strictly according to API documentation
    const response = await post({
      url: URL.ADD,
      data: { bookId }
    });

    console.log('Server response:', response);

    // Ensure the response is valid
    if (!response) {
      return { state: 'error', message: 'Server did not return a response' };
    }

    // If the addition is successful, update the local cache at the same time
    if (response.state === 'success') {
      try {
        const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const exists = localCart.some(item => item.bookId === bookId);
        if (!exists) {
          localCart.push({ bookId });
          localStorage.setItem('cartItems', JSON.stringify(localCart));
        }
      } catch (error) {
        console.error('Failed to update local cart cache:', error);
      }
    }

    return response;
  } catch (error) {
    console.error('Failed to add to cart:', error);

    // Return a friendly error response instead of throwing an exception
    return {
      state: 'error',
      message: error instanceof Error ? error.message : 'Failed to add to cart'
    };
  }
}

/**
 * Get cart content
 * @returns {Promise<CartItemsResponse>} Response containing book ID list
 */
export async function getCartItems(): Promise<CartItemsResponse> {
  try {
    const response = await post({
      url: URL.GET
    });

    // Log response
    console.log('Get cart response:', response);

    // Ensure the returned bookId is an array
    if (!response) {
      console.warn('Get cart: Server returned empty response');
      return { bookId: [] };
    }

    if (!response.bookId) {
      console.warn('API returned cart data missing bookId field', response);
      return { bookId: [] };
    }

    if (!Array.isArray(response.bookId)) {
      console.warn('API returned bookId is not an array format, converting', response.bookId);
      return { bookId: [response.bookId].filter(Boolean) };
    }

    return response;
  } catch (error) {
    console.error('Failed to get cart content:', error);
    return { bookId: [] };
  }
}

/**
 * Remove book from cart
 * @param {string|string[]} bookId Book ID or ID array
 * @returns {Promise<CartSuccessResponse>} Response result
 */
export async function removeFromCart(bookId: string | string[]): Promise<CartSuccessResponse> {
  // Validate parameters
  if (!bookId || (Array.isArray(bookId) && bookId.length === 0)) {
    console.error('removeFromCart: Invalid bookId provided', bookId);
    return { state: 'error', message: 'Invalid book ID' };
  }

  // Ensure bookId is an array
  const bookIds = Array.isArray(bookId) ? bookId : [bookId];

  try {
    const response = await post({
      url: URL.REMOVE,
      data: { bookId: bookIds }
    });

    return response || { state: 'error', message: 'Server did not return a response' };
  } catch (error) {
    console.error('Failed to remove from cart:', error);
    return {
      state: 'error',
      message: error instanceof Error ? error.message : 'Failed to remove from cart'
    };
  }
}

/**
 * Clear cart
 * @returns {Promise<CartSuccessResponse>} Response result
 */
export const clearCart = async (): Promise<CartSuccessResponse> => {
  try {
    const response = await post({
      url: URL.CLEAR
    });

    return response || { state: 'error', message: 'Server did not return a response' };
  } catch (error) {
    console.error('Failed to clear cart:', error);
    return {
      state: 'error',
      message: error instanceof Error ? error.message : 'Failed to clear cart'
    };
  }
};
