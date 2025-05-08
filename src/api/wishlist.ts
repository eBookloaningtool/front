/**
 * Wishlist related interfaces
 */
import { post } from '../utils/request.ts';

// Interface type definition
interface WishlistSuccessResponse {
  state: string;
}

interface WishlistItemsResponse {
  bookId: string[];
}

// Interface address enumeration
const URL = {
  ADD: '/api/wishlist/add',
  GET: '/api/wishlist/get',
  DELETE: '/api/wishlist/delete'
};

/**
 * Add a book to the wishlist
 * @param {string} bookId Book ID
 * @returns {Promise<WishlistSuccessResponse>} Response result
 */
export async function addToWishlist(bookId: string): Promise<WishlistSuccessResponse> {
  return post({
    url: URL.ADD,
    data: { bookId }
  });
}

/**
 * Get wishlist content
 * @returns {Promise<WishlistItemsResponse>} Response containing book ID list
 */
export async function getWishlist(): Promise<WishlistItemsResponse> {
  return post({
    url: URL.GET
  });
}

/**
 * Remove a book from the wishlist
 * @param {string} bookId Book ID
 * @returns {Promise<WishlistSuccessResponse>} Response result
 */
export async function removeFromWishlist(bookId: string): Promise<WishlistSuccessResponse> {
  return post({
    url: URL.DELETE,
    data: { bookId }
  });
}
