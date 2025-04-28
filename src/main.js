import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Router configuration from router/index.js
import './index.css' // Import Tailwind CSS
import axios from 'axios'
import 'remixicon/fonts/remixicon.css'
import mockAPI from './mock-api' // 导入mock API实现

// 开发环境中模拟数据
// 强制设置mockMode为true，确保开发环境下可以正常使用
console.log('Running with Mock API enabled');
window.mockMode = true;

// 配置axios拦截器以使用mock数据
axios.interceptors.request.use(
  async config => {
    // 如果启用了mock模式，使用mock数据代替实际请求
    if (window.mockMode && config.url.startsWith('/api/')) {
      console.log(`[Mock] 拦截请求: ${config.method.toUpperCase()} ${config.url}`);
      const method = config.method.toLowerCase();
      
      // 获取认证头，确保传递给mock API
      const headers = config.headers || {};
      let authHeader = {};
      
      // 从请求中获取认证令牌
      if (config.headers && config.headers.Authorization) {
        authHeader = { Authorization: config.headers.Authorization };
      } else {
        // 尝试从localStorage获取令牌
        const token = localStorage.getItem('token');
        if (token) {
          authHeader = { Authorization: `Bearer ${token}` };
        }
      }
      
      if (method === 'get') {
        return Promise.reject({
          config,
          mockResponse: await mockAPI.get(config.url)
        });
      } else if (method === 'post') {
        return Promise.reject({
          config,
          mockResponse: await mockAPI.post(config.url, config.data, authHeader)
        });
      }
    }
    return config;
  }, 
  error => Promise.reject(error)
);

axios.interceptors.response.use(
  response => response,
  error => {
    // 如果是mock响应，则返回mock数据
    if (error.mockResponse) {
      console.log('[Mock] 返回模拟数据:', error.mockResponse);
      return Promise.resolve({
        data: error.mockResponse,
        status: 200,
        statusText: 'OK (Mocked)',
        headers: {},
        config: error.config,
      });
    }
    
    return Promise.reject(error);
  }
);

const app = createApp(App)

// 全局设置axios基础URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''

// 挂载axios到全局属性
app.config.globalProperties.$axios = axios

app.use(router)   // Install router functionality
app.mount('#app') // Mount App.vue to <div id="app"> in HTML
