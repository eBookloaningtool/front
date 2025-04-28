import axios, { AxiosError } from 'axios';

// 假设存在一个获取认证 Token 的函数
// 你需要根据你的项目实际情况来实现或导入它
// 例如: import { getAuthToken } from '@/utils/auth';
const getAuthToken = (): string | null => {
  // 示例实现，请替换为你的实际逻辑
  return localStorage.getItem('authToken');
};

// --- TypeScript Interfaces ---

interface PopularBooksResponse {
  bookId: string[];
}

interface BookDetail {
  bookId: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  category: string;
  availableCopies: number;
  totalCopies: number;
  price: number;
  rating: number;
  borrowTimes: number;
}

interface BookContentRequest {
  bookId: string;
}

interface BookContentResponse {
  bookId: string;
  contentURL: string;
}

interface SearchBooksParams {
  title?: string;
  author?: string;
  category?: string;
}

interface SearchBooksResponse {
  state: 'success' | 'error'; // 根据文档响应添加状态
  bookId: string[];
  message?: string; // 可选的错误消息
}

// --- API Functions ---

/**
 * 获取热门书籍列表
 * @returns {Promise<PopularBooksResponse>} - 热门书籍ID列表
 */
export const getPopularBooks = async (): Promise<PopularBooksResponse> => {
  try {
    const response = await axios.get<PopularBooksResponse>('/api/books/popular');
    return response.data;
  } catch (error) {
    console.error('获取热门书籍失败:', error instanceof AxiosError ? error.message : error);
    // 返回符合接口的默认值
    return { bookId: [] };
  }
};

/**
 * 获取书籍详情
 * @param {string} bookId - 书籍ID
 * @returns {Promise<BookDetail | null>} - 书籍详细信息或 null
 */
export const getBookDetail = async (bookId: string): Promise<BookDetail | null> => {
  if (!bookId) {
    console.error('获取书籍详情失败: bookId 不能为空');
    return null;
  }
  try {
    const response = await axios.get<BookDetail>(`/api/books/${bookId}`);
    return response.data;
  } catch (error) {
    console.error(`获取书籍详情失败 (ID: ${bookId}):`, error instanceof AxiosError ? error.message : error);
    return null;
  }
};

/**
 * 获取电子书内容链接
 * @param {string} bookId - 书籍ID
 * @returns {Promise<BookContentResponse | null>} - 书籍内容信息或 null
 */
export const getBookContent = async (bookId: string): Promise<BookContentResponse | null> => {
  if (!bookId) {
    console.error('获取书籍内容失败: bookId 不能为空');
    return null;
  }
  const token = getAuthToken();
  if (!token) {
    console.error('获取书籍内容失败: 未找到认证 Token');
    // 根据你的应用逻辑，这里可能需要重定向到登录页或抛出错误
    return null;
  }

  try {
    const response = await axios.post<BookContentResponse>(
      '/api/books/content',
      { bookId } as BookContentRequest,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`获取书籍内容失败 (ID: ${bookId}):`, error instanceof AxiosError ? error.message : error);
    // 可以根据状态码处理特定错误，例如 401 Unauthorized
    if (error instanceof AxiosError && error.response?.status === 401) {
      console.error('认证失败，请重新登录。');
      // 可能需要触发登出逻辑
    }
    return null;
  }
};

/**
 * 搜索书籍
 * @param {SearchBooksParams} params - 搜索参数 (title, author, category)
 * @returns {Promise<SearchBooksResponse>} - 搜索结果
 */
export const searchBooks = async (searchType, query) => {
  try {
    const response = await axios.get(`/api/books/search?${searchType}=${query}`);
    return response.data;
  } catch (error) {
    console.error('搜索书籍失败:', error);
    throw error;
  }
}; 