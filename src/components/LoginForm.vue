<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import mockAPI from '../mock-api.js';

const router = useRouter();
const emit = defineEmits(['login-success']);

// Form data
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);
const loginSuccess = ref(false);

// 忘记密码相关状态
const showForgetPasswordModal = ref(false);
const forgetPasswordEmail = ref('');
const forgetPasswordSubmitting = ref(false);
const forgetPasswordMessage = ref({ text: '', type: '' }); // type: 'success' 或 'error'

// Field status management
const fieldStatus = reactive({
  email: {
    focused: false,
    valid: true
  },
  password: {
    focused: false,
    valid: true
  }
});

// Set field focus status
const setFieldFocus = (field, status) => {
  fieldStatus[field].focused = status;
};

// Form validation
const validateForm = () => {
  let isValid = true;

  if (!email.value) {
    fieldStatus.email.valid = false;
    errorMessage.value = 'Please enter your email address';
    isValid = false;
  } else {
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      fieldStatus.email.valid = false;
      errorMessage.value = 'Please enter a valid email address';
      isValid = false;
    } else {
      fieldStatus.email.valid = true;
    }
  }

  if (!password.value) {
    if (isValid) errorMessage.value = 'Please enter your password';
    fieldStatus.password.valid = false;
    isValid = false;
  } else {
    fieldStatus.password.valid = true;
  }

  return isValid;
};

// Real-time validation for individual fields
const validateField = (field) => {
  if (field === 'email' && email.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    fieldStatus.email.valid = emailRegex.test(email.value);
  }

  if (field === 'password') {
    fieldStatus.password.valid = password.value.length > 0;
  }
};

// 打开忘记密码弹窗
const openForgetPasswordModal = () => {
  // 如果登录表单中已经填写了邮箱，则自动填入
  if (email.value && fieldStatus.email.valid) {
    forgetPasswordEmail.value = email.value;
  } else {
    forgetPasswordEmail.value = '';
  }

  showForgetPasswordModal.value = true;
  forgetPasswordMessage.value = { text: '', type: '' };
};

// 关闭忘记密码弹窗
const closeForgetPasswordModal = () => {
  showForgetPasswordModal.value = false;
  forgetPasswordSubmitting.value = false;
};

// 验证邮箱格式
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 处理忘记密码请求
const handleForgetPassword = async () => {
  // 验证邮箱
  if (!forgetPasswordEmail.value) {
    forgetPasswordMessage.value = {
      text: '请输入邮箱地址',
      type: 'error'
    };
    return;
  }

  if (!validateEmail(forgetPasswordEmail.value)) {
    forgetPasswordMessage.value = {
      text: '请输入有效的邮箱地址',
      type: 'error'
    };
    return;
  }

  try {
    forgetPasswordSubmitting.value = true;
    forgetPasswordMessage.value = { text: '', type: '' };

    // 调用忘记密码API
    const response = await mockAPI.post('/api/auth/forget', {
      email: forgetPasswordEmail.value
    });

    if (response.state === 'success') {
      forgetPasswordMessage.value = {
        text: '密码重置邮件已发送，请检查您的邮箱',
        type: 'success'
      };

      // 3秒后关闭弹窗
      setTimeout(() => {
        closeForgetPasswordModal();
      }, 3000);
    } else {
      forgetPasswordMessage.value = {
        text: response.message || '密码重置失败，请稍后再试',
        type: 'error'
      };
    }
  } catch (error) {
    console.error('Password reset error:', error);
    forgetPasswordMessage.value = {
      text: '发生错误，请稍后再试',
      type: 'error'
    };
  } finally {
    forgetPasswordSubmitting.value = false;
  }
};

// Handle login
const handleLogin = async () => {
  try {
    // Reset error message
    errorMessage.value = '';

    // Form validation
    if (!validateForm()) {
      return;
    }

    isSubmitting.value = true;

    // Build request data
    const loginData = {
      email: email.value,
      password: password.value
    };

    // Use mock API to send login request
    const data = await mockAPI.post('/api/auth/login', loginData);

    if (data.state === 'success') {
      // Show success status
      loginSuccess.value = true;

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('uuid', data.UUID);

      // Emit login success event for parent component
      emit('login-success');

      // Redirect to home page after delay
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } else {
      // Handle login failure with specific error message
      errorMessage.value = data.message || 'Login failed, please check your email and password';
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.value = 'An error occurred during login, please try again later';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="login-form-container p-8 bg-white rounded-xl shadow-lg border border-gray-100">
    <h2 class="text-2xl font-bold mb-6 text-center text-indigo-800">Login</h2>

    <!-- Login success message -->
    <div v-if="loginSuccess" class="success-message">
      <div class="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-center text-gray-800 mt-4">Login Successful!</h3>
      <p class="text-center text-gray-600 mt-2">Redirecting to home page...</p>
    </div>

    <form v-else @submit.prevent="handleLogin" class="space-y-5">
      <!-- Error message display -->
      <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md mb-4 transition-all duration-300" role="alert">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <!-- Email input -->
      <div class="form-group">
        <label for="email" class="block text-sm font-medium mb-1" :class="[
          fieldStatus.email.focused ? 'text-indigo-600' : 'text-gray-700',
          !fieldStatus.email.valid ? 'text-red-600' : ''
        ]">Email</label>
        <div class="relative rounded-md shadow-sm">
          <input
            id="email"
            v-model="email"
            type="email"
            class="w-full px-4 py-3 border rounded-lg transition-colors"
            :class="[
              fieldStatus.email.focused ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300',
              !fieldStatus.email.valid ? 'border-red-500 ring-2 ring-red-200' : ''
            ]"
            placeholder="Enter your email"
            required
            @focus="setFieldFocus('email', true)"
            @blur="setFieldFocus('email', false); validateField('email')"
            @input="validateField('email')"
          />
          <div v-if="!fieldStatus.email.valid" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Password input -->
      <div class="form-group">
        <label for="password" class="block text-sm font-medium mb-1" :class="[
          fieldStatus.password.focused ? 'text-indigo-600' : 'text-gray-700',
          !fieldStatus.password.valid ? 'text-red-600' : ''
        ]">Password</label>
        <div class="relative rounded-md shadow-sm">
          <input
            id="password"
            v-model="password"
            type="password"
            class="w-full px-4 py-3 border rounded-lg transition-colors"
            :class="[
              fieldStatus.password.focused ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300',
              !fieldStatus.password.valid ? 'border-red-500 ring-2 ring-red-200' : ''
            ]"
            placeholder="Enter your password"
            required
            @focus="setFieldFocus('password', true)"
            @blur="setFieldFocus('password', false); validateField('password')"
            @input="validateField('password')"
          />
          <div v-if="!fieldStatus.password.valid" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Login button -->
      <button
        type="submit"
        class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition duration-300 mt-6 transform hover:scale-105 active:scale-95"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Logging in...
        </span>
        <span v-else>Login</span>
      </button>

      <!-- Don't have an account? Register -->
      <div class="text-center mt-6">
        <router-link to="/register" class="text-indigo-600 hover:text-indigo-800 font-medium transition-colors hover:underline">
          Don't have an account? Register
        </router-link>
      </div>

      <!-- Forgot password link -->
      <div class="text-center mt-2">
        <a href="#" class="text-gray-500 hover:text-gray-700 text-sm transition-colors hover:underline" @click.prevent="openForgetPasswordModal">
          Forgot password?
        </a>
      </div>
    </form>

    <!-- 忘记密码模态框 -->
    <div v-if="showForgetPasswordModal" class="forget-password-modal">
      <div class="modal-overlay" @click="closeForgetPasswordModal"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="text-xl font-semibold text-gray-800">忘记密码</h3>
          <button class="close-button" @click="closeForgetPasswordModal">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <p class="text-gray-600 mb-4">请输入您的邮箱地址，我们会向您发送重置密码的邮件。</p>

          <!-- 消息显示 -->
          <div v-if="forgetPasswordMessage.text"
               class="message-alert mb-4"
               :class="forgetPasswordMessage.type === 'success' ? 'success-alert' : 'error-alert'">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg v-if="forgetPasswordMessage.type === 'success'" class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm">{{ forgetPasswordMessage.text }}</p>
              </div>
            </div>
          </div>

          <!-- 邮箱输入 -->
          <div class="form-group">
            <label for="forget-email" class="block text-sm font-medium text-gray-700 mb-1">邮箱地址</label>
            <input
              id="forget-email"
              v-model="forgetPasswordEmail"
              type="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              placeholder="请输入您的邮箱"
              required
            />
          </div>
        </div>

        <div class="modal-footer">
          <button
            class="cancel-button"
            @click="closeForgetPasswordModal"
            :disabled="forgetPasswordSubmitting"
          >
            取消
          </button>
          <button
            class="submit-button"
            @click="handleForgetPassword"
            :disabled="forgetPasswordSubmitting"
          >
            <span v-if="forgetPasswordSubmitting" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              处理中...
            </span>
            <span v-else>发送重置邮件</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-form-container {
  animation: fadeIn 0.5s ease-out;
  transition: all 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.success-message {
  animation: successFadeIn 0.5s ease-out;
  padding: 2rem 1rem;
}

@keyframes successFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.success-icon {
  animation: iconPop 0.5s ease-out 0.2s both;
  transform-origin: center;
}

@keyframes iconPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

input {
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
}

button {
  transition: all 0.3s ease;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 忘记密码模态框样式 */
.forget-password-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 10;
}

.modal-container {
  position: relative;
  width: 90%;
  max-width: 450px;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  z-index: 20;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from { transform: translateY(20px); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: #6b7280;
  background-color: white;
  border: 1px solid #d1d5db;
}

.cancel-button:hover {
  background-color: #f3f4f6;
}

.submit-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: white;
  background-color: #4f46e5;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-button:hover {
  background-color: #4338ca;
}

.message-alert {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
}

.success-alert {
  background-color: #ecfdf5;
  color: #065f46;
  border-left: 4px solid #10b981;
}

.error-alert {
  background-color: #fef2f2;
  color: #991b1b;
  border-left: 4px solid #ef4444;
}
</style>
