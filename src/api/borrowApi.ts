import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { post } from '../utils/request';

// --- 接口定义 ---

/** 借阅成功响应 */
interface BorrowSuccessResponse {
  state: 'success';
  dueDate: string; // YYYY-MM-DD
  balance: number;
}

/** 续借成功响应 */
interface RenewSuccessResponse {
  state: 'success';
  newDueDate: string; // YYYY-MM-DD
}

/** 余额不足响应 */
interface InsufficientBalanceResponse {
  state: 'insufficient balance';
  newPayment: number;
}

/** 达到借阅上限响应 */
interface ReachBorrowLimitResponse {
  state: 'Reach borrow limit';
}

/** 借阅失败响应(包含无效书籍、库存不足、已借阅等问题) */
interface BorrowFailedResponse {
  state: 'Borrow failed.';
  InvalidBookIds?: string[];
  LowStockBookIds?: string[];
  BorrowedBookIds?: string[];
}

/** 没有可用副本响应 */
interface NoAvailableCopiesResponse {
  state: 'no_available_copies';
  error: string;
}

/** 超出借阅限制响应 */
interface ExceedLimitResponse {
  state: 'exceed_limit';
  error: string;
}

/** 归还成功响应 */
interface ReturnSuccessResponse {
  state: 'success';
}

/** 通用错误响应 */
interface ErrorResponse {
  state: 'error';
  message: string;
  // 可以根据后端实际返回添加更多错误信息字段
  // e.g., errorCode?: number;
}

/** 借阅记录项 */
interface BorrowRecord {
  borrowId: string;
  bookId: string;
  borrowDate: string;
  dueDate: string;
}

/** 历史借阅记录项 */
interface BorrowHistoryRecord extends BorrowRecord {
  returnDate: string;
  status: string; // 例如 "returned"
}

/** 借阅列表响应 */
interface BorrowListResponse {
  state: string;
  data: BorrowRecord[];
}

/** 借阅历史响应 */
interface BorrowHistoryResponse {
  state: string;
  data: BorrowHistoryRecord[];
}

/** borrowBook 可能的响应类型 */
type BorrowApiResponse = BorrowSuccessResponse | InsufficientBalanceResponse | ReachBorrowLimitResponse | BorrowFailedResponse | NoAvailableCopiesResponse | ExceedLimitResponse | ErrorResponse;
/** returnBook 可能的响应类型 */
type ReturnApiResponse = ReturnSuccessResponse | ErrorResponse;
/** renewBook 可能的响应类型 */
type RenewApiResponse = RenewSuccessResponse | InsufficientBalanceResponse | ErrorResponse;

// --- 辅助函数 ---

/**
 * 获取包含 JWT Token 的 Axios 请求配置
 * @returns {AxiosRequestConfig} Axios 请求配置对象
 */
const getAuthConfig = (): AxiosRequestConfig => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('JWT token not found in localStorage. Application logic should handle redirection or errors.');
    // 返回空的 headers 或根据应用逻辑抛出错误
    // return { headers: {} };
    // 或者可以考虑在这里抛出错误，让调用方处理
    // throw new Error('Authentication token not found.');
  }
  return {
    headers: {
      // 仅在 token 存在时添加 Authorization 头
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
};

// --- API 调用函数 ---

/**
 * 借阅电子书 - 支持批量借阅
 * @param {string|string[]} bookId - 单个书籍ID或书籍ID数组
 * @returns {Promise<BorrowApiResponse>} - 借阅结果
 */
export const borrowBook = async (bookId: string | string[]): Promise<BorrowApiResponse> => {
  try {
    // 确保 bookId 始终作为数组传递
    const bookIdParam = Array.isArray(bookId) ? bookId : [bookId];

    // 获取认证token
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('借阅书籍时未找到认证令牌，可能导致认证失败');
    }

    const response = await post({
      url: '/api/borrow/borrow',
      data: { bookId: bookIdParam },
      headers
    });
    return response;
  } catch (error) {
    console.error('借阅书籍失败:', error);
    throw error;
  }
};

/**
 * 归还电子书 (取消借阅)
 * @param {string} bookId - 书籍ID
 * @returns {Promise<ReturnApiResponse>} - 归还结果
 */
export const returnBook = async (bookId: string): Promise<ReturnApiResponse> => {
  try {
    const response = await axios.post<ReturnSuccessResponse>(
      '/api/borrow/return/',
      { bookId },
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error('归还电子书失败:', (error as AxiosError)?.response?.data || (error as Error).message);
    const axiosError = error as AxiosError<ErrorResponse>;
    return axiosError.response?.data || { state: 'error', message: (error as Error).message || 'Unknown error occurred' };
  }
};

/**
 * 续借电子书
 * @param {string} bookId - 书籍ID
 * @returns {Promise<RenewApiResponse>} - 续借结果
 */
export const renewBook = async (bookId: string): Promise<RenewApiResponse> => {
  try {
    const response = await axios.post<RenewSuccessResponse | InsufficientBalanceResponse>(
      '/api/borrow/renew/',
      { bookId },
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error('续借电子书失败:', (error as AxiosError)?.response?.data || (error as Error).message);
    const axiosError = error as AxiosError<ErrorResponse>; // 假设错误响应也遵循 ErrorResponse 结构
    return axiosError.response?.data || { state: 'error', message: (error as Error).message || 'Unknown error occurred' };
  }
};

/**
 * 获取用户当前借阅列表
 * @returns {Promise<BorrowListResponse>} - 借阅记录列表
 */
export const getBorrowList = async (): Promise<BorrowListResponse> => {
  try {
    const response = await axios.post<BorrowListResponse>(
      '/api/borrow/borrowlist/',
      {},  // 无需请求体参数
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error('获取借阅列表失败:', (error as AxiosError)?.response?.data || (error as Error).message);
    // 出错时返回空数据
    return { state: 'error', data: [] };
  }
};

/**
 * 获取用户借阅历史记录
 * @returns {Promise<BorrowHistoryResponse>} - 借阅历史记录
 */
export const getBorrowHistory = async (): Promise<BorrowHistoryResponse> => {
  try {
    const response = await axios.post<BorrowHistoryResponse>(
      '/api/borrow/history/',
      {},  // 无需请求体参数
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error('获取借阅历史失败:', (error as AxiosError)?.response?.data || (error as Error).message);
    // 出错时返回空数据
    return { state: 'error', data: [] };
  }
};
