/**
 * 购物车相关接口
 */
import { post } from '../utils/request';
import axios from 'axios';

// 接口类型定义
interface CartSuccessResponse {
  state: string;
  message?: string;
}

interface CartItemsResponse {
  bookId: string[];
}

// 接口地址枚举
const URL = {
  ADD: '/api/cart/add',
  GET: '/api/cart/get',
  REMOVE: '/api/cart/remove',
  CLEAR: '/api/cart/clear'
};

/**
 * 添加书籍到购物车
 * @param {string} bookId 书籍ID
 * @returns {Promise<CartSuccessResponse>} 响应结果
 */
export async function addToCart(bookId: string): Promise<CartSuccessResponse> {
  // 验证bookId有效性
  if (!bookId) {
    console.error('addToCart: 提供的bookId无效', bookId);
    return { state: 'error', message: '无效的书籍ID' };
  }

  try {
    console.log(`正在将书籍(${bookId})添加到购物车...`);

    // 严格按照API文档发送请求
    const response = await post({
      url: URL.ADD,
      data: { bookId }
    });

    console.log('服务器响应:', response);

    // 确保响应是有效的
    if (!response) {
      return { state: 'error', message: '服务器未返回响应' };
    }

    // 如果添加成功，同时更新本地缓存
    if (response.state === 'success') {
      try {
        const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const exists = localCart.some(item => item.bookId === bookId);
        if (!exists) {
          localCart.push({ bookId });
          localStorage.setItem('cartItems', JSON.stringify(localCart));
        }
      } catch (error) {
        console.error('更新本地购物车缓存失败:', error);
      }
    }

    return response;
  } catch (error) {
    console.error('添加到购物车请求失败:', error);

    // 返回友好的错误响应而不是抛出异常
    return {
      state: 'error',
      message: error instanceof Error ? error.message : '添加到购物车失败'
    };
  }
}

/**
 * 获取购物车内容
 * @returns {Promise<CartItemsResponse>} 包含书籍ID列表的响应
 */
export async function getCartItems(): Promise<CartItemsResponse> {
  try {
    const response = await post({
      url: URL.GET
    });

    // 日志记录响应
    console.log('获取购物车响应:', response);

    // 确保返回的bookId是数组
    if (!response) {
      console.warn('获取购物车: 服务器返回空响应');
      return { bookId: [] };
    }

    if (!response.bookId) {
      console.warn('API返回的购物车数据缺少bookId字段', response);
      return { bookId: [] };
    }

    if (!Array.isArray(response.bookId)) {
      console.warn('API返回的bookId不是数组格式，进行转换', response.bookId);
      return { bookId: [response.bookId].filter(Boolean) };
    }

    return response;
  } catch (error) {
    console.error('获取购物车内容失败:', error);
    return { bookId: [] };
  }
}

/**
 * 从购物车中移除书籍
 * @param {string|string[]} bookId 书籍ID或ID数组
 * @returns {Promise<CartSuccessResponse>} 响应结果
 */
export async function removeFromCart(bookId: string | string[]): Promise<CartSuccessResponse> {
  // 验证参数
  if (!bookId || (Array.isArray(bookId) && bookId.length === 0)) {
    console.error('removeFromCart: 提供的bookId无效', bookId);
    return { state: 'error', message: '无效的书籍ID' };
  }

  // 确保bookId是数组
  const bookIds = Array.isArray(bookId) ? bookId : [bookId];

  try {
    const response = await post({
      url: URL.REMOVE,
      data: { bookId: bookIds }
    });

    return response || { state: 'error', message: '服务器未返回响应' };
  } catch (error) {
    console.error('从购物车移除失败:', error);
    return {
      state: 'error',
      message: error instanceof Error ? error.message : '从购物车移除失败'
    };
  }
}

/**
 * 清空购物车
 * @returns {Promise<CartSuccessResponse>} 响应结果
 */
export const clearCart = async (): Promise<CartSuccessResponse> => {
  try {
    const response = await post({
      url: URL.CLEAR
    });

    return response || { state: 'error', message: '服务器未返回响应' };
  } catch (error) {
    console.error('清空购物车失败:', error);
    return {
      state: 'error',
      message: error instanceof Error ? error.message : '清空购物车失败'
    };
  }
};
