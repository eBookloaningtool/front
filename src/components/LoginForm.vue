<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import { userAPI } from '../services/api';

const router = useRouter();
const userStore = useUserStore();
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

// 处理忘记密码
const handleForgetPassword = async () => {
  try {
    forgetPasswordSubmitting.value = true;
    forgetPasswordMessage.value = { text: '', type: '' };

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgetPasswordEmail.value)) {
      forgetPasswordMessage.value = {
        text: '请输入有效的邮箱地址',
        type: 'error'
      };
      return;
    }

    // 发送忘记密码请求
    const response = await userAPI.forgetPassword({
      email: forgetPasswordEmail.value
    });

    if (response.data.state === 'success') {
      forgetPasswordMessage.value = {
        text: '重置密码链接已发送到您的邮箱',
        type: 'success'
      };
      // 关闭模态框
      setTimeout(() => {
        showForgetPasswordModal.value = false;
      }, 2000);
    } else {
      forgetPasswordMessage.value = {
        text: response.data.message || '发送重置密码链接失败',
        type: 'error'
      };
    }
  } catch (error) {
    console.error('Forget password error:', error);
    forgetPasswordMessage.value = {
      text: '发送重置密码链接时发生错误',
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

    // 使用API服务发送登录请求
    const response = await userStore.login(loginData);

    if (response.state === 'success') {
      // Show success status
      loginSuccess.value = true;

      // Emit login success event for parent component to handle redirection
      setTimeout(() => {
        emit('login-success');
      }, 1000);
    } else {
      // Handle login failure with specific error message
      errorMessage.value = response.message || '登录失败，请检查邮箱和密码';
    }
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.value = '登录过程中发生错误，请稍后重试';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="login-form-container py-4">
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

    <form v-else @submit.prevent="handleLogin" class="space-y-7">
      <!-- Error message display -->
      <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md mb-5 transition-all duration-300" role="alert">
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
        <input
          id="email"
          v-model="email"
          type="email"
          class="w-full px-6 py-4 bg-gray-100 border-none rounded-lg transition-colors text-base"
          :class="[
            fieldStatus.email.focused ? 'ring-2 ring-blue-200' : '',
            !fieldStatus.email.valid ? 'ring-2 ring-red-200' : ''
          ]"
          placeholder="Username/Email"
          required
          @focus="setFieldFocus('email', true)"
          @blur="setFieldFocus('email', false); validateField('email')"
          @input="validateField('email')"
        />
        <div v-if="!fieldStatus.email.valid" class="text-red-500 text-xs mt-1">
          Please enter a valid email address
        </div>
      </div>

      <!-- Password input -->
      <div class="form-group">
        <input
          id="password"
          v-model="password"
          type="password"
          class="w-full px-6 py-4 bg-gray-100 border-none rounded-lg transition-colors text-base"
          :class="[
            fieldStatus.password.focused ? 'ring-2 ring-blue-200' : '',
            !fieldStatus.password.valid ? 'ring-2 ring-red-200' : ''
          ]"
          placeholder="Password"
          required
          @focus="setFieldFocus('password', true)"
          @blur="setFieldFocus('password', false); validateField('password')"
          @input="validateField('password')"
        />
        <div v-if="!fieldStatus.password.valid" class="text-red-500 text-xs mt-1">
          Please enter your password
        </div>
      </div>

      <!-- Login button -->
      <button
        type="submit"
        class="w-full py-4 px-4 bg-yellow-400 hover:bg-yellow-500 text-white font-medium rounded-lg transition duration-300 text-base"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting">Logging in...</span>
        <span v-else>Login</span>
      </button>

      <!-- Forgot password link -->
      <div class="text-center mt-6">
        <a href="#" @click.prevent="openForgetPasswordModal" class="text-gray-600 hover:text-gray-800 text-base">
          Forgot Password?
        </a>
      </div>
    </form>

    <!-- Forgot password modal -->
    <div v-if="showForgetPasswordModal" class="forget-password-modal">
      <div class="modal-overlay" @click="closeForgetPasswordModal"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="text-xl font-semibold text-gray-800">Forgot Password</h3>
          <button class="close-button" @click="closeForgetPasswordModal">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <p class="text-gray-600 mb-6 text-base">Please enter your email address and we'll send you a password reset link.</p>

          <!-- Message display -->
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

          <!-- Email input -->
          <div class="form-group mb-8">
            <label for="forget-email" class="block text-base font-medium text-gray-700 mb-2">Email Address</label>
            <input
              id="forget-email"
              v-model="forgetPasswordEmail"
              type="email"
              class="w-full px-6 py-4 bg-gray-100 border-none rounded-lg transition-colors text-base"
              placeholder="Please enter your email"
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
            Cancel
          </button>
          <button
            class="submit-button bg-yellow-400 hover:bg-yellow-500"
            @click="handleForgetPassword"
            :disabled="forgetPasswordSubmitting"
          >
            <span v-if="forgetPasswordSubmitting">Processing...</span>
            <span v-else>Send Reset Link</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-form-container {
  transition: all 0.3s ease;
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
  height: 3.5rem;
  font-size: 1rem;
  border: none;
  outline: none;
  box-shadow: none;
}

input:focus {
  outline: none;
  border: none;
  box-shadow: none;
}

button {
  transition: all 0.3s ease;
  height: 3.5rem;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Forgot password modal styles */
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
  max-width: 480px;
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
  padding: 1.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 1.75rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1.5rem;
  padding: 1.75rem;
  border-top: 1px solid #e5e7eb;
}

.cancel-button {
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: #6b7280;
  background-color: white;
  border: 1px solid #d1d5db;
  height: auto;
}

.cancel-button:hover {
  background-color: #f3f4f6;
}

.submit-button {
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: white;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  height: auto;
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
