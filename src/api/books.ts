import axios, { AxiosError } from 'axios';

// Suppose there is a function to get an authentication token
// You need to implement or import it according to your project reality
// For example: import { getAuthToken } from '@/utils/auth';
const getAuthToken = (): string | null => {
  // Example implementation, please replace with your actual logic
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
  state: 'success' | 'error'; // Add status based on document response
  bookId: string[];
  message?: string; // Optional error message
}

// --- API Functions ---

/**
 * Get popular books list
 * @returns {Promise<PopularBooksResponse>} - Popular books ID list
 */
export const getPopularBooks = async (): Promise<PopularBooksResponse> => {
  try {
    const response = await axios.get<PopularBooksResponse>('/api/books/popular');
    return response.data;
  } catch (error) {
    console.error('Get popular books failed:', error instanceof AxiosError ? error.message : error);
    // Return default value interface
    return { bookId: [] };
  }
};

/**
 * Get book details
 * @param {string} bookId - Book ID
 * @returns {Promise<BookDetail | null>} - Book details or null
 */
export const getBookDetail = async (bookId: string): Promise<BookDetail | null> => {
  if (!bookId) {
    console.error('Get book details failed: bookId cannot be empty');
    return null;
  }
  try {
    const response = await axios.get<BookDetail>(`/api/books/get?bookId=${bookId}`);
    return response.data;
  } catch (error) {
    console.error(`Get book details failed (ID: ${bookId}):`, error instanceof AxiosError ? error.message : error);
    return null;
  }
};

/**
 * Get electronic book content
 * @param bookId Electronic book ID
 * @returns Electronic book content
 */
export async function getBookContent(bookId: string) {
  try {
    const response = await axios.post('/api/books/content', { bookId });
    return response.data;
  } catch (error) {
    console.error('Get electronic book content failed:', error);
    throw error;
  }
}

/**
 * Search books
 * @param {SearchBooksParams} params - Search parameters (title, author, category)
 * @returns {Promise<SearchBooksResponse>} - Search results
 */
export const searchBooks = async (params: SearchBooksParams): Promise<SearchBooksResponse> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params.title) queryParams.append('title', params.title);
    if (params.author) queryParams.append('author', params.author);
    if (params.category) queryParams.append('category', params.category);

    // Ensure at least one search parameter
    if (queryParams.toString() === '') {
      return { state: 'error', bookId: [], message: 'At least one search parameter is required' };
    }

    const response = await axios.get<SearchBooksResponse>(`/api/books/search?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Search books failed:', error);
    return { state: 'error', bookId: [], message: 'Search failed, please try again later' };
  }
};
