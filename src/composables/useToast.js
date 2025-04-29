/**
 * Toast提示组合式API
 */

import { ref } from 'vue';

// 创建一个全局状态来管理toast消息
const toasts = ref([]);

/**
 * 显示toast提示消息
 * @param {string} message 消息内容
 * @param {string} type 消息类型 'info' | 'success' | 'error' | 'warning'
 * @param {number} duration 显示持续时间（毫秒）
 */
export function useToast() {
  /**
   * 显示一个toast通知
   * @param {string} message - 要显示的消息
   * @param {string} type - toast类型 ('success', 'error', 'info', 'warning')
   * @param {number} duration - 显示时长（毫秒）
   */
  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    
    // 添加新的toast到数组
    toasts.value.push({
      id,
      message,
      type,
      show: true
    });
    
    // 设置定时器自动关闭toast
    setTimeout(() => {
      // 找到对应的toast并标记为关闭
      const index = toasts.value.findIndex(toast => toast.id === id);
      if (index !== -1) {
        toasts.value[index].show = false;
        
        // 给动画一些时间，然后从数组中移除
        setTimeout(() => {
          toasts.value = toasts.value.filter(toast => toast.id !== id);
        }, 300);
      }
    }, duration);
  };
  
  return {
    toasts,
    showToast
  };
}

// 默认导出单例模式的toast服务
export default useToast(); 