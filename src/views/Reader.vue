<template>
  <div class="reader-wrapper">
    <!-- Back -->
    <button class="back-btn" @click="router.back()">← Back</button>

    <!-- Only render the reader when address is ready -->
    <pdf-app
      v-if="src"
      :pdf="src"
      style="height: 100%; width: 100%"
    />

    <!-- Placeholder / Initial loading -->
    <div v-else class="loading-tip">Loading…</div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PdfApp from 'vue3-pdf-app'
import 'vue3-pdf-app/dist/icons/main.css'

const route  = useRoute()
const router = useRouter()

/* src holds the actual PDF link */
const src = ref('')

/* Watch for URL query parameter changes, also triggered on first entry */
watchEffect(() => {
  const q = route.query.url
  src.value = q ? decodeURIComponent(q) : ''
})
</script>

<style scoped>
.reader-wrapper {
  position: fixed;
  inset: 0;                   /* equivalent to top:0 right:0 bottom:0 left:0 */
  width: 100vw;
  height: 100vh;
  background: #fff;
  z-index: 9999;
  overflow: hidden;
}
.back-btn{
  position:absolute;top:calc(52px + 8px);left:20px;
  padding:6px 12px;border:none;border-radius:4px;
  background:#f59e0b;color:#fff;font-size:14px;cursor:pointer;
  z-index:12000;
}
.back-btn:hover{background:#d97706}
.loading-tip{
  position:absolute;inset:0;
  display:flex;align-items:center;justify-content:center;
  color:#9ca3af;font-size:14px;
}
</style>
