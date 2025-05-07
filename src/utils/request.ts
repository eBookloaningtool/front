// src/utils/request.ts
import axios from 'axios';

/**
 * 封装POST请求方法
 * @param options 请求选项
 */
export const post = async ({ url, data = {}, headers = {} }: {
  url: string;
  data?: any;
  headers?: Record<string, string>;
}): Promise<any> => {
  try {
    console.log(`[API] 发送POST请求: ${url}`, { data, headers: { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : undefined } });

    // 发送请求
    const response = await axios.post(url, data, { headers });

    // 记录响应（不含敏感数据）
    console.log(`[API] 收到响应: ${url}`, {
      status: response.status,
      data: response.data
    });

    return response.data;
  } catch (error) {
    // 详细错误日志
    if (axios.isAxiosError(error)) {
      console.error(`[API] 请求错误: ${url}`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // 如果服务器返回了错误响应，使用其数据
      if (error.response?.data) {
        return error.response.data;
      }
    } else {
      console.error(`[API] 非Axios错误: ${url}`, error);
    }

    // 抛出错误
    throw error;
  }
};

/**
 * 封装GET请求方法
 * @param options 请求选项
 */
export const get = async ({ url, params = {}, headers = {} }: {
  url: string;
  params?: any;
  headers?: Record<string, string>;
}): Promise<any> => {
  try {
    console.log(`[API] 发送GET请求: ${url}`, {
      params,
      headers: {
        ...headers,
        Authorization: headers.Authorization ? 'Bearer ***' : undefined
      }
    });

    // 获取token并添加到headers
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log('[API] 已添加认证token到请求头');
    } else {
      console.warn('[API] 未找到认证token');
    }

    // 发送请求
    const response = await axios.get(url, { params, headers });

    // 记录响应（不含敏感数据）
    console.log(`[API] 收到响应: ${url}`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    return response.data;
  } catch (error) {
    // 详细错误日志
    if (axios.isAxiosError(error)) {
      console.error(`[API] 请求错误: ${url}`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        headers: error.response?.headers
      });

      // 如果服务器返回了错误响应，使用其数据
      if (error.response?.data) {
        return error.response.data;
      }
    } else {
      console.error(`[API] 非Axios错误: ${url}`, error);
    }

    // 抛出错误
    throw error;
  }
};