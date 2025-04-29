/**
 * 图片工具函数
 */

// 获取图书封面URL
export const getBookCoverUrl = (bookId) => {
  return `/images/book-covers/book${bookId}.jpg`;
};

// 图片加载错误处理
export const handleImageError = (event) => {
  event.target.src = '/images/default-book-cover.html';
  // 添加默认样式，让占位符更好看
  event.target.style.backgroundColor = '#e0e0e0';
  event.target.style.display = 'flex';
  event.target.style.justifyContent = 'center';
  event.target.style.alignItems = 'center';
  event.target.style.color = '#666';
  event.target.style.fontSize = '12px';
};

// 批量预加载图片
export const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map(url => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = resolve;
        img.onerror = resolve; // 即使加载失败也继续
      });
    })
  );
}; 