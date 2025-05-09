import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { post, get } from '../utils/request';

// --- Interface definition ---

/** Borrow success response */
interface BorrowSuccessResponse {
  state: 'success';
  dueDate: string; // YYYY-MM-DD
  balance: number;
}

/** Renew success response */
interface RenewSuccessResponse {
  state: 'success';
  newDueDate: string; // YYYY-MM-DD
}

/** Insufficient balance response */
interface InsufficientBalanceResponse {
  state: 'insufficient balance';
  newPayment: number;
}

/** Reach borrow limit response */
interface ReachBorrowLimitResponse {
  state: 'Reach borrow limit';
}

/** Borrow failed response (includes invalid books, insufficient stock, already borrowed, etc.) */
interface BorrowFailedResponse {
  state: 'Borrow failed.';
  InvalidBookIds?: string[];
  LowStockBookIds?: string[];
  BorrowedBookIds?: string[];
}

/** No available copies response */
interface NoAvailableCopiesResponse {
  state: 'no_available_copies';
  error: string;
}

/** Exceed borrow limit response */
interface ExceedLimitResponse {
  state: 'exceed_limit';
  error: string;
}

/** Return success response */
interface ReturnSuccessResponse {
  state: 'success';
}

/** General error response */
interface ErrorResponse {
  state: 'error';
  message: string;
  // Add more error information fields based on actual backend returns
  // e.g., errorCode?: number;
}

/** Borrow record item */
interface BorrowRecord {
  borrowId: string;
  bookId: string;
  borrowDate: string;
  dueDate: string;
}

/** Borrow history record item */
interface BorrowHistoryRecord extends BorrowRecord {
  returnDate: string;
  status: string; // For example, "returned"
  bookTitle: string;
  bookAuthor: string;
  bookCover?: string;
}

/** Borrow list response */
interface BorrowListResponse {
  state: string;
  data: BorrowRecord[];
}

/** Borrow history response */
interface BorrowHistoryResponse {
  state: string;
  data: BorrowHistoryRecord[];
}

/** borrowBook possible response types */
type BorrowApiResponse = BorrowSuccessResponse | InsufficientBalanceResponse | ReachBorrowLimitResponse | BorrowFailedResponse | NoAvailableCopiesResponse | ExceedLimitResponse | ErrorResponse;
/** returnBook possible response types */
type ReturnApiResponse = ReturnSuccessResponse | ErrorResponse;
/** renewBook possible response types */
type RenewApiResponse = RenewSuccessResponse | InsufficientBalanceResponse | ErrorResponse;

// --- Helper functions ---

/**
 * Get Axios request configuration with JWT Token
 * @returns {AxiosRequestConfig} Axios request configuration object
 */
const getAuthConfig = (): AxiosRequestConfig => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('JWT token not found in localStorage. Application logic should handle redirection or errors.');
    // Return empty headers or throw an error based on application logic
    // return { headers: {} };
    // Alternatively, you can throw an error here to let the caller handle it
    // throw new Error('Authentication token not found.');
  }
  return {
    headers: {
      // Add Authorization header only when token exists
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
};

// --- API call functions ---

/**
 * Borrow electronic book - supports batch borrowing
 * @param {string|string[]} bookId - Single book ID or book ID array
 * @returns {Promise<BorrowApiResponse>} - Borrow result
 */
export const borrowBook = async (bookId: string | string[]): Promise<BorrowApiResponse> => {
  try {
    // Ensure bookId is always passed as an array
    const bookIdParam = Array.isArray(bookId) ? bookId : [bookId];

    // Get authentication token
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Token not found when borrowing books, authentication might fail');
    }

    const response = await post({
      url: '/api/borrow/borrow',
      data: { bookId: bookIdParam },
      headers
    });
    return response;
  } catch (error) {
    console.error('Failed to borrow book:', error);
    throw error;
  }
};

/**
 * Return electronic book (cancel borrowing)
 * @param {string} bookId - Book ID
 * @returns {Promise<ReturnApiResponse>} - Return result
 */
export const returnBook = async (bookId: string): Promise<ReturnApiResponse> => {
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Token not found when returning books, authentication might fail');
    }

    const response = await post({
      url: '/api/borrow/return',
      data: { bookId },
      headers
    });
    return response;
  } catch (error) {
    console.error('Failed to return book:', error);
    return { state: 'error', message: (error as Error).message || 'Unknown error occurred' };
  }
};

/**
 * Renew electronic book
 * @param {string} bookId - Book ID
 * @returns {Promise<RenewApiResponse>} - Renew result
 */
export const renewBook = async (bookId: string): Promise<RenewApiResponse> => {
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('Token not found when renewing books, authentication might fail');
    }

    const response = await post({
      url: '/api/borrow/renew',
      data: { bookId },
      headers
    });
    return response;
  } catch (error) {
    console.error('Failed to renew book:', error);
    return { state: 'error', message: (error as Error).message || 'Unknown error occurred' };
  }
};

/**
 * Get user current borrow list
 * @returns {Promise<BorrowListResponse>} - Borrow record list
 */
export const getBorrowList = async (): Promise<BorrowListResponse> => {
  try {
    const response = await axios.post<BorrowListResponse>(
      '/api/borrow/borrowlist',
      {},  // No request body parameters
      getAuthConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Failed to get borrow list:', (error as AxiosError)?.response?.data || (error as Error).message);
    // Return empty data when an error occurs
    return { state: 'error', data: [] };
  }
};

/**
 * Get user borrow history
 * @returns {Promise<BorrowHistoryResponse>} - Borrow history
 */
export const getBorrowHistory = async (): Promise<BorrowHistoryResponse> => {
  try {
    const response = await post({
      url: '/api/borrow/history',
      data: {}
    });

    // Ensure each borrow record has the correct cover URL and book name
    const historyWithCovers = await Promise.all(
      response.data.map(async (loan) => {
        try {
          // Get book details to get cover URL and book name
          const bookDetail = await get({
            url: `/api/books/get?bookId=${loan.bookId}`
          });

          return {
            ...loan,
            cover: bookDetail.coverUrl || '/images/books/default-cover.jpg',
            title: bookDetail.title || loan.bookTitle,
            author: bookDetail.author || loan.bookAuthor
          };
        } catch (error) {
          console.error(`Failed to get book details for ${loan.bookId}:`, error);
          return {
            ...loan,
            cover: '/images/books/default-cover.jpg',
            title: loan.bookTitle,
            author: loan.bookAuthor
          };
        }
      })
    );

    return {
      state: response.state,
      data: historyWithCovers
    };
  } catch (error) {
    console.error('Failed to get borrow history:', error);
    return { state: 'error', data: [] };
  }
};
