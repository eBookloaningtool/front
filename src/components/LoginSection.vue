<!-- LoginSection.vue -->
<template>
  <section class="login-section" v-if="!isLoggedIn">
    <div class="login-banner">
      <div class="banner-content">
        <h2>Join Our eBook World</h2>
        <p>Register as a member and enjoy unlimited reading pleasure</p>
        <div class="banner-actions">
          <router-link to="/login" class="login-link">Login</router-link>
          <router-link to="/register" class="register-link">Register</router-link>
        </div>
      </div>
      <div class="banner-image">
        <img src="https://picsum.photos/seed/ebook/500/300" alt="eBook Reading" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '../stores/userStore';

const userStore = useUserStore();
const isLoggedIn = computed(() => userStore.isAuthenticated);
</script>

<style scoped>
.login-section {
  margin: 30px 0;
}

.login-banner {
  background: linear-gradient(135deg, #fffbf0 0%, #fff5e0 100%);
  border-radius: 12px;
  padding: 30px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.banner-content {
  flex: 1;
  padding-right: 30px;
}

.banner-content h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 15px;
}

.banner-content p {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
  line-height: 1.5;
}

.banner-actions {
  display: flex;
  gap: 15px;
}

.login-link, .register-link {
  display: inline-block;
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: transform 0.3s, background 0.3s;
}

.login-link {
  background: transparent;
  border: 2px solid #e9a84c;
  color: #e9a84c;
}

.login-link:hover {
  background: rgba(233, 168, 76, 0.1);
  transform: translateY(-3px);
}

.register-link {
  background: #e9a84c;
  color: white;
  border: 2px solid #e9a84c;
}

.register-link:hover {
  background: #d89638;
  transform: translateY(-3px);
}

.banner-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.banner-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.5s;
}

.banner-image img:hover {
  transform: scale(1.03);
}

@media (max-width: 768px) {
  .login-banner {
    flex-direction: column;
    padding: 20px;
  }
  
  .banner-content {
    padding-right: 0;
    margin-bottom: 30px;
    text-align: center;
  }
  
  .banner-actions {
    justify-content: center;
  }
}
</style> 