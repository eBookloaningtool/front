import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    hmr: {
      overlay: false
    },
    proxy: {
      '/api/pay': {
        target: 'http://homepages.cs.ncl.ac.uk/daniel.nesbitt/CSC8019/HorsePay',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/pay/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
            res.statusCode = 500;
            res.end('Mock API Error: ' + err.message);
          });
        },
        bypass: (req, res, options) => {
          console.log('Bypassing proxy for:', req.url);
          return req.url;
        }
      }
    }
  }
})
