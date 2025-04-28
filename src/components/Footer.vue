<!-- Footer.vue -->
<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-section about">
        <h3>About Us</h3>
        <p>The electronic book borrowing system provides a large number of high-quality electronic book resources, making reading more simple and convenient. We are committed to providing the best reading experience for readers.</p>
      </div>

      <div class="footer-section links">
        <h3>Quick Links</h3>
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/categories">Categories</router-link></li>
          <li><router-link to="/help">Help Center</router-link></li>
        </ul>
      </div>

      <div class="footer-section contact">
        <h3>Contact Us</h3>
        <ul>
          <li><i class="ri-mail-line"></i> contact@ebookservice.com</li>
          <li><i class="ri-phone-line"></i> 400-123-4567</li>
          <li><i class="ri-map-pin-line"></i> No.1 Zhongguancun Street, Haidian District, Beijing</li>
        </ul>
      </div>

      <div class="footer-section social">
        <h3>Follow Us</h3>
        <div class="social-icons">
          <a href="#" title="Weibo"><i class="ri-weibo-line"></i></a>
          <a href="#" title="WeChat"><i class="ri-wechat-line"></i></a>
          <a href="#" title="QQ"><i class="ri-qq-line"></i></a>
          <a href="#" title="Zhihu"><i class="ri-zhihu-line"></i></a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} Electronic Book Borrowing System | All Rights Reserved</p>
      <p>
        <router-link to="/terms">Service Terms</router-link> |
        <router-link to="/privacy">Privacy Policy</router-link>
      </p>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
// 注意：Remix 图标通过 index.html 中的 CDN 链接引入，不需要在这里导入

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background-color: #f8f8f8;
  padding: 50px 0 20px;
  margin-top: auto;
  border-top: 1px solid #eee;
}

.footer-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
  position: relative;
}

.footer-section h3:after {
  content: '';
  display: block;
  width: 30px;
  height: 2px;
  background: #e9a84c;
  margin-top: 8px;
}

.about p {
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}

.links ul, .contact ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.links li, .contact li {
  margin-bottom: 12px;
}

.links a, .contact li {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.links a:hover {
  color: #e9a84c;
}

.social-icons {
  display: flex;
  gap: 15px;
}

.social-icons a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  color: #666;
  transition: all 0.3s ease;
}

.social-icons a:hover {
  background: #e9a84c;
  color: white;
  transform: translateY(-3px);
}

.social-icons i {
  font-size: 20px;
}

.footer-bottom {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.footer-bottom a {
  color: #999;
  text-decoration: none;
}

.footer-bottom a:hover {
  color: #e9a84c;
}

a {
  cursor: pointer;
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .footer-container {
    grid-template-columns: 1fr;
  }
}
</style>
