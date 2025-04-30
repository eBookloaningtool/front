import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Router configuration from router/index.js
import './index.css' // Import Tailwind CSS
import axios from 'axios'
import 'remixicon/fonts/remixicon.css'
import { createPinia } from 'pinia'

// 创建Pinia实例
const pinia = createPinia()

// 配置axios默认值
axios.defaults.baseURL = 'https://api.borrowbee.wcy.one:61700/';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// 添加请求拦截器处理认证
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Axios] 已添加认证token到请求头');
    } else {
      console.warn('[Axios] 未找到认证token');
    }
    console.log('[Axios] 发送请求:', {
      url: config.url,
      method: config.method,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? 'Bearer ***' : undefined
      }
    });
    return config;
  },
  error => {
    console.error('[Axios] 请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器处理错误
axios.interceptors.response.use(
  response => {
    console.log('[Axios] 收到响应:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  error => {
    if (error.response) {
      console.error('[Axios] 响应错误:', {
        url: error.config?.url,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      switch (error.response.status) {
        case 401:
          // 未认证，清除token并跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // 权限不足
          console.error('[Axios] 权限不足');
          break;
        case 404:
          // 资源不存在
          console.error('[Axios] 请求的资源不存在');
          break;
        case 500:
          // 服务器错误
          console.error('[Axios] 服务器错误');
          break;
        default:
          console.error('[Axios] 请求失败:', error.response.data);
      }
    } else if (error.request) {
      console.error('[Axios] 请求未收到响应:', error.request);
    } else {
      console.error('[Axios] 请求配置错误:', error.message);
    }
    return Promise.reject(error);
  }
);

const app = createApp(App)

// 挂载axios到全局属性
app.config.globalProperties.$axios = axios

app.use(pinia)    // 添加Pinia
app.use(router)   // Install router functionality
app.mount('#app') // Mount App.vue to <div id="app"> in HTML
