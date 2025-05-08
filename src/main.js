import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Router configuration from router/index.js
import './index.css' // Import Tailwind CSS
import axios from 'axios'
import 'remixicon/fonts/remixicon.css'
import { createPinia } from 'pinia'

// Creating a Pinia Instance
const pinia = createPinia()

// Configure axios defaults
axios.defaults.baseURL = 'https://api.borrowbee.wcy.one:61700/';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to handle authentication
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Axios] Token added to request headers');
    } else {
      console.warn('[Axios] No token found');
    }
    console.log('[Axios] Sending request:', {
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
    console.error('[Axios] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axios.interceptors.response.use(
  response => {
    console.log('[Axios] Received response:', {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  error => {
    if (error.response) {
      console.error('[Axios] Response error:', {
        url: error.config?.url,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      switch (error.response.status) {
        case 401:
          // Unauthorized, clear token and redirect to login page
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // Insufficient permissions
          console.error('[Axios] Insufficient permissions');
          break;
        case 404:
          // Resource not found
          console.error('[Axios] Resource not found');
          break;
        case 500:
          // Server error
          console.error('[Axios] Server error');
          break;
        default:
          console.error('[Axios] Request failed:', error.response.data);
      }
    } else if (error.request) {
      console.error('[Axios] Request not received:', error.request);
    } else {
      console.error('[Axios] Request configuration error:', error.message);
    }
    return Promise.reject(error);
  }
);

const app = createApp(App)

// Mount axios to global properties
app.config.globalProperties.$axios = axios

app.use(pinia)    // Add Pinia
app.use(router)   // Install router functionality
app.mount('#app') // Mount App.vue to <div id="app"> in HTML
