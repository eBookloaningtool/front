/**
 * 愿望清单相关接口
 */
import { post } from '../utils/request.ts';

// 接口类型定义
interface WishlistSuccessResponse {
  state: string;
}

interface WishlistItemsResponse {
  bookId: string[];
}

// 接口地址枚举
const URL = {
  ADD: '/api/wishlist/add',
  GET: '/api/wishlist/get',
  DELETE: '/api/wishlist/delete'
};

/**
 * 添加书籍到愿望清单
 * @param {string} bookId 书籍ID
 * @returns {Promise<WishlistSuccessResponse>} 响应结果
 */
export async function addToWishlist(bookId: string): Promise<WishlistSuccessResponse> {
  return post({
    url: URL.ADD,
    data: { bookId }
  });
}

/**
 * 获取愿望清单内容
 * @returns {Promise<WishlistItemsResponse>} 包含书籍ID列表的响应
 */
export async function getWishlist(): Promise<WishlistItemsResponse> {
  return post({
    url: URL.GET
  });
}

/**
 * 从愿望清单中删除书籍
 * @param {string} bookId 书籍ID
 * @returns {Promise<WishlistSuccessResponse>} 响应结果
 */
export async function removeFromWishlist(bookId: string): Promise<WishlistSuccessResponse> {
  return post({
    url: URL.DELETE,
    data: { bookId }
  });
} 