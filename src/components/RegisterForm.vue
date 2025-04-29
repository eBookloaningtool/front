<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import mockAPI from '../mock-api.js';

const router = useRouter();

// Form data
const name = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);
const registerSuccess = ref(false);

// Simple validation
const validateForm = () => {
  if (!name.value || !email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields';
    return false;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Please enter a valid email address';
    return false;
  }

  // Password length validation
  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long';
    return false;
  }

  return true;
};

// Submit registration
const handleSubmit = async () => {
  try {
    // Reset error message
    errorMessage.value = '';

    // Form validation
    if (!validateForm()) {
      return;
    }

    isSubmitting.value = true;

    // Build request data
    const userData = {
      name: name.value,
      email: email.value,
      password: password.value
    };

    // Use mock API to send registration request
    const data = await mockAPI.post('/api/auth/register', userData);

    if (data.state === 'success') {
      // Show success status
      registerSuccess.value = true;

      // Cache login info for easy login
      localStorage.setItem('registeredEmail', email.value);
      localStorage.setItem('userName', name.value);

      // Trigger registration success event after delay (1秒后触发跳转)
      setTimeout(() => {
        emit('registration-success', {
          name: name.value,
          email: email.value
        });
      }, 1000);
    } else {
      // Handle failure
      errorMessage.value = data.message || 'Registration failed, please try again later';

      // 检查错误信息是否包含"Email already registered"或"邮箱已注册"
      if (
        data.message && (
          data.message.includes('Email already registered') ||
          data.message.includes('email already registered') ||
          data.message.includes('邮箱已注册') ||
          data.message.includes('Email already') ||
          data.message === 'Email already registered'
        )
      ) {
        // 显示错误消息1秒后跳转到登录页面
        setTimeout(() => {
          // 保存邮箱方便登录页面自动填充
          localStorage.setItem('registeredEmail', email.value);
          router.push('/login');
        }, 1500);
      }
    }
  } catch (error) {
    console.error('Registration request error:', error);
    errorMessage.value = 'An error occurred during registration, please try again later';
  } finally {
    isSubmitting.value = false;
  }
};

// Define emit events
const emit = defineEmits(['registration-success']);
</script>

<template>
  <div class="register-form-container py-4">
    <!-- Registration success message -->
    <div v-if="registerSuccess" class="success-message">
      <div class="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-center text-gray-800 mt-4">Registration Successful!</h3>
      <p class="text-center text-gray-600 mt-2">Redirecting to home page...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-7">
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

      <!-- Name input -->
      <div class="form-group">
        <input
          id="name"
          v-model="name"
          type="text"
          class="w-full px-6 py-4 bg-gray-100 border-none rounded-lg transition-colors text-base"
          placeholder="Full Name"
          required
        />
      </div>

      <!-- Email input -->
      <div class="form-group">
        <input
          id="email"
          v-model="email"
          type="email"
          class="w-full px-6 py-4 bg-gray-100 border-none rounded-lg transition-colors text-base"
          placeholder="Email Address"
          required
        />
      </div>

      <!-- Password input -->
      <div class="form-group">
        <input
          id="password"
          v-model="password"
          type="password"
          class="w-full px-6 py-4 bg-gray-100 border-none rounded-lg transition-colors text-base"
          placeholder="Create Password"
          required
        />
      </div>

      <!-- Register button -->
      <button
        type="submit"
        class="w-full py-4 px-4 bg-yellow-400 hover:bg-yellow-500 text-white font-medium rounded-lg transition duration-300 text-base"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting">Registering...</span>
        <span v-else>Create Account</span>
      </button>

      <!-- Password requirements -->
      <div class="text-center mt-2">
        <p class="text-gray-500 text-base">Password must be at least 6 characters</p>
      </div>
    </form>
  </div>
</template>

<style scoped>
.register-form-container {
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

input::placeholder {
  color: #9ca3af;
}

button {
  transition: all 0.3s ease;
  height: 3.5rem;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>