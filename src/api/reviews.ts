/**
 * 评论模块相关接口
 */

// 引入请求方法
import { post, get } from '../utils/request.ts';

// 接口类型定义
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

// 接口地址枚举
const URL = {
  ADD_REVIEW: '/api/books/addreviews',
  DELETE_REVIEW: '/api/reviews/delete',
  USER_REVIEWS: '/api/reviews/user',
  BOOK_REVIEWS: '/api/reviews/book',
  REVIEW_CONTENT: '/api/reviews/content'
};

/**
 * 添加评论
 * @param {Object} data 评论信息 { bookId, rating, comment }
 * @returns {Promise<ReviewAddResponse>} 返回评论ID
 */
export async function addReview(data: { bookId: string; rating: number; comment: string }): Promise<ReviewAddResponse> {
  return post({
    url: URL.ADD_REVIEW,
    data
  });
}

/**
 * 删除评论
 * @param {String} commentID 评论ID
 * @returns {Promise<DeleteReviewResponse>} 操作结果
 */
export async function deleteReview(commentID: string): Promise<DeleteReviewResponse> {
  return post({
    url: URL.DELETE_REVIEW,
    data: { commentID }
  });
}

/**
 * 获取用户的所有评论
 * @returns {Promise<UserReviewsResponse>} 用户评论列表
 */
export async function getUserReviews(): Promise<UserReviewsResponse> {
  return post({
    url: URL.USER_REVIEWS
  });
}

/**
 * 获取指定书籍的所有评论
 * @param {String} bookId 书籍ID
 * @returns {Promise<BookReviewsResponse>} 书籍评论列表
 */
export async function getBookReviews(bookId: string): Promise<BookReviewsResponse> {
  return get({
    url: `${URL.BOOK_REVIEWS}?bookId=${bookId}`
  });
}

/**
 * 获取评论内容
 * @param {String} commentID 评论ID
 * @returns {Promise<ReviewContentResponse>} 评论内容
 */
export async function getReviewContent(commentID: string): Promise<ReviewContentResponse> {
  return get({
    url: `${URL.REVIEW_CONTENT}?commentID=${commentID}`
  });
} 