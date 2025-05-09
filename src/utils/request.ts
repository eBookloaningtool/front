// src/utils/request.ts
import axios from 'axios';

/**
 * Wrap POST request method
 * @param options Request options
 */
export const post = async ({ url, data = {}, headers = {} }: {
  url: string;
  data?: any;
  headers?: Record<string, string>;
}): Promise<any> => {
  try {
    // Get token and add to headers
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log('[API] Token added to request headers');
    } else {
      console.warn('[API] No token found');
    }

    console.log(`[API] Sending POST request: ${url}`, { data, headers: { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : undefined } });

    // Send request
    const response = await axios.post(url, data, { headers });

    // Record response (without sensitive data)
    console.log(`[API] Received response: ${url}`, {
      status: response.status,
      data: response.data
    });

    return response.data;
  } catch (error) {
    // Detailed error log
    if (axios.isAxiosError(error)) {
      console.error(`[API] Request error: ${url}`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // If the server returns an error response, use its data
      if (error.response?.data) {
        return error.response.data;
      }
    } else {
      console.error(`[API] Non-Axios error: ${url}`, error);
    }

    // Throw error
    throw error;
  }
};

/**
 * Wrap GET request method
 * @param options Request options
 */
export const get = async ({ url, params = {}, headers = {} }: {
  url: string;
  params?: any;
  headers?: Record<string, string>;
}): Promise<any> => {
  try {
    console.log(`[API] Sending GET request: ${url}`, {
      params,
      headers: {
        ...headers,
        Authorization: headers.Authorization ? 'Bearer ***' : undefined
      }
    });

    // Get token and add to headers
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log('[API] Token added to request headers');
    } else {
      console.warn('[API] No token found');
    }

    // Send request
    const response = await axios.get(url, { params, headers });

    // Record response (without sensitive data)
    console.log(`[API] Received response: ${url}`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    return response.data;
  } catch (error) {
    // Detailed error log
    if (axios.isAxiosError(error)) {
      console.error(`[API] Request error: ${url}`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        headers: error.response?.headers
      });

      // If the server returns an error response, use its data
      if (error.response?.data) {
        return error.response.data;
      }
    } else {
      console.error(`[API] Non-Axios error: ${url}`, error);
    }

    // Throw error
    throw error;
  }
};
