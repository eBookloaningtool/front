/**
 * Review module related interfaces
 */

// Import request method
import { post, get } from '../utils/request.ts';

// Interface type definition
interface ReviewAddResponse {
  state: string;
  commentID: string;
}

interface UserReviewsResponse {
  comments: string[];
}

interface BookReviewsResponse {
  comments: string[];
}

interface ReviewContentResponse {
  UUID: string;
  rating: number;
  comment: string;
}

interface DeleteReviewResponse {
  state: string;
}

// Interface address enumeration
const URL = {
  ADD_REVIEW: '/api/books/addreviews',
  DELETE_REVIEW: '/api/reviews/delete',
  USER_REVIEWS: '/api/reviews/user',
  BOOK_REVIEWS: '/api/reviews/book',
  REVIEW_CONTENT: '/api/reviews/content'
};

/**
 * Add comment
 * @param {Object} data Comment information { bookId, rating, comment }
 * @returns {Promise<ReviewAddResponse>} Return comment ID
 */
export async function addReview(data: { bookId: string; rating: number; comment: string }): Promise<ReviewAddResponse> {
  return post({
    url: URL.ADD_REVIEW,
    data
  });
}

/**
 * Delete comment
 * @param {String} commentID Comment ID
 * @returns {Promise<DeleteReviewResponse>} Operation result
 */
export async function deleteReview(commentID: string): Promise<DeleteReviewResponse> {
  return post({
    url: URL.DELETE_REVIEW,
    data: { commentID }
  });
}

/**
 * Get all comments of a user
 * @returns {Promise<UserReviewsResponse>} User comment list
 */
export async function getUserReviews(): Promise<UserReviewsResponse> {
  return post({
    url: URL.USER_REVIEWS
  });
}

/**
 * Get all comments of a book
 * @param {String} bookId Book ID
 * @returns {Promise<BookReviewsResponse>} Book comment list
 */
export async function getBookReviews(bookId: string): Promise<BookReviewsResponse> {
  return get({
    url: `${URL.BOOK_REVIEWS}?bookId=${bookId}`
  });
}

/**
 * Get comment content
 * @param {String} commentID Comment ID
 * @returns {Promise<ReviewContentResponse>} Comment content
 */
export async function getReviewContent(commentID: string): Promise<ReviewContentResponse> {
  return get({
    url: `${URL.REVIEW_CONTENT}?commentID=${commentID}`
  });
}
