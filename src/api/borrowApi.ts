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

    const response = await post({
      url: '/api/borrow/borrow',
      data: { bookId: bookIdParam }
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
    const response = await post({
      url: '/api/borrow/return/',
      data: { bookId }
    });
    return response;
  } catch (error) {
    console.error('归还电子书失败:', error);
    // 确保返回一个合适的错误响应
    return { state: 'error', message: error instanceof Error ? error.message : '未知错误' };
  }
};

/**
 * 续借电子书
 * @param {string} bookId - 书籍ID
 * @returns {Promise<RenewApiResponse>} - 续借结果
 */
export const renewBook = async (bookId: string): Promise<RenewApiResponse> => {
  try {
    const response = await post({
      url: '/api/borrow/renew/',
      data: { bookId }
    });
    return response;
  } catch (error) {
    console.error('续借电子书失败:', error);
    // 确保返回一个合适的错误响应
    return { state: 'error', message: error instanceof Error ? error.message : '未知错误' };
  }
};

/**
 * 获取用户当前借阅列表
 * @returns {Promise<BorrowListResponse>} - 借阅记录列表
 */
export const getBorrowList = async (): Promise<BorrowListResponse> => {
  try {
    const response = await post({
      url: '/api/borrow/borrowlist/'
    });
    return response;
  } catch (error) {
    console.error('获取借阅列表失败:', error);
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
    const response = await post({
      url: '/api/borrow/history/'
    });
    return response;
  } catch (error) {
    console.error('获取借阅历史失败:', error);
    // 出错时返回空数据
    return { state: 'error', data: [] };
  }
};
