// API Configuration
const API_BASE_URL = ''; // TODO: Add actual API base URL

// API Request Utility Function
async function apiRequest(endpoint, options = {}) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_BASE_URL + endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Back button functionality
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (document.referrer) {
                window.location.href = document.referrer;
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    // Undo button functionality
    const undoBtn = document.querySelector('.undo-btn');
    undoBtn.addEventListener('click', () => {
        history.forward();
    });

    // Search functionality
    const searchForm = document.querySelector('.search-bar');
    const searchInput = searchForm.querySelector('input');
    const searchBtn = searchForm.querySelector('button');

    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        performSearch(searchInput.value);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch(searchInput.value);
        }
    });

    // Login functionality
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        const loginInput = loginForm.querySelector('input');
        const loginBtn = loginForm.querySelector('.login-btn');

        loginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleLogin(loginInput.value);
        });
    }

    // Category item click event
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const category = item.querySelector('span').textContent;
            navigateToCategory(category);
        });
    });

    // User button click event
    const userBtn = document.querySelector('.user-btn');
    if (userBtn) {
        userBtn.addEventListener('click', () => {
            window.location.href = 'user-profile.html';
        });
    }

    // Book card click event
    const bookCards = document.querySelectorAll('.book-card');
    bookCards.forEach(card => {
        card.addEventListener('click', async () => {
            try {
                const bookId = card.dataset.bookId;
                if (!bookId) {
                    throw new Error('Invalid book ID');
                }

                // Get basic information from the card
                const title = card.querySelector('h3').textContent;
                const coverUrl = card.querySelector('img').src;
                const rating = parseFloat(card.querySelector('.book-rating span').textContent);
                const priceText = card.querySelector('.book-price').textContent;
                const price = parseFloat(priceText.match(/£([\d.]+)/)[1]);

                // Store basic information
                const basicBookInfo = {
                    bookId: bookId,
                    title: title,
                    coverUrl: coverUrl,
                    rating: rating,
                    price: price
                };

                sessionStorage.setItem('selectedBook', JSON.stringify(basicBookInfo));
                window.location.href = 'book-detail.html';
            } catch (error) {
                console.error('Failed to process book click event:', error);
                alert('Failed to get book information, please try again');
            }
        });
    });

    // Book detail page functionality
    if (window.location.pathname.includes('book-detail.html')) {
        loadBookDetails();
        initializeTabs();
        initializeDetailPageActions();
    }

    // Initialize login and registration forms
    initializeLoginForm();
    initializeRegisterForm();
});

// Search functionality implementation
function performSearch(query) {
    if (!query.trim()) {
        alert('Please enter search content');
        return;
    }
    console.log('Search:', query);
    // TODO: Implement actual search functionality
}

// Login functionality implementation
async function handleLogin(email, password) {
    if (!email.trim() || !password.trim()) {
        alert('Please enter email address and password');
        return;
    }
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }

    try {
        const response = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId);
        alert('Login successful');
        location.reload();
    } catch (error) {
        alert('Login failed, please check your email and password');
    }
}

// Registration functionality implementation
async function handleRegister(formData) {
    try {
        const response = await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        alert('Registration successful, please login');
        window.location.href = 'index.html';
    } catch (error) {
        alert('Registration failed, please try again');
    }
}

// Password strength check
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strength = checkPasswordStrength(password);
    const strengthBar = document.querySelector('.password-strength');
    if (!strengthBar) return;

    const colors = ['#ff4444', '#ffbb33', '#00C851', '#33b5e5', '#2BBBAD'];
    strengthBar.style.background = `linear-gradient(to right, ${colors[strength-1]} ${strength*20}%, #eee ${strength*20}%)`;
}

// Initialize registration form
function initializeRegisterForm() {
    const form = document.querySelector('.register-form');
    if (!form) return;

    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const agreeTerms = document.getElementById('agreeTerms');
    const submitButton = document.querySelector('.register-submit-btn');

    // Listen for password input
    passwordInput?.addEventListener('input', (e) => {
        updatePasswordStrength(e.target.value);
    });

    // Validate form
    function validateForm() {
        const password = passwordInput?.value;
        const confirmPassword = confirmPasswordInput?.value;
        const isAgreed = agreeTerms?.checked;

        if (submitButton) {
            submitButton.disabled = !password ||
                                  !confirmPassword ||
                                  password !== confirmPassword ||
                                  checkPasswordStrength(password) < 3 ||
                                  !isAgreed;
        }
    }

    // Add form validation listeners
    [passwordInput, confirmPasswordInput, agreeTerms].forEach(element => {
        element?.addEventListener('input', validateForm);
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = {
            email: document.getElementById('email')?.value,
            password: passwordInput?.value,
            username: document.getElementById('username')?.value,
            studentId: document.getElementById('studentId')?.value
        };

        await handleRegister(formData);
    });
}

// Initialize login form
function initializeLoginForm() {
    const loginForm = document.querySelector('.login-form');
    if (!loginForm) return;

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const loginBtn = loginForm.querySelector('.login-btn');
    const registerBtn = loginForm.querySelector('.register-btn');

    loginBtn?.addEventListener('click', async (e) => {
        e.preventDefault();
        await handleLogin(emailInput?.value, passwordInput?.value);
    });

    registerBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'register.html';
    });
}

// Category navigation functionality
function navigateToCategory(category) {
    console.log('Navigate to category:', category);
    // TODO: Implement actual category navigation functionality
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 获取书籍详情
async function getBookDetails(bookId) {
    return await apiRequest(`/api/books/get?bookId=${bookId}`);
}

// 加载书籍详情
async function loadBookDetails() {
    const bookInfo = JSON.parse(sessionStorage.getItem('selectedBook'));
    if (!bookInfo) return;

    try {
        // 获取完整的书籍信息
        const fullBookInfo = await getBookDetails(bookInfo.bookId);

        // 设置基本信息
        document.getElementById('bookCover').src = fullBookInfo.coverUrl;
        document.getElementById('bookTitle').textContent = fullBookInfo.title;
        document.getElementById('bookAuthor').textContent = fullBookInfo.author;
        document.getElementById('bookDescription').textContent = fullBookInfo.description;
        document.getElementById('bookPrice').textContent = `£${fullBookInfo.price}/Week`;

        // 加载评论
        await loadBookReviews(bookInfo.bookId);
    } catch (error) {
        alert('加载书籍详情失败');
    }
}

// 加载书籍评论
async function loadBookReviews(bookId) {
    try {
        const reviews = await apiRequest(`/api/reviews/book?bookId=${bookId}`);
        const reviewsDiv = document.getElementById('bookReviews');
        if (!reviewsDiv) return;

        const reviewsHtml = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <span class="reviewer">${review.username}</span>
                    <span class="review-rating">${review.rating}.0</span>
                </div>
                <p>${review.comment}</p>
            </div>
        `).join('');

        reviewsDiv.innerHTML = `<h3>读者评论</h3>${reviewsHtml}`;
    } catch (error) {
        console.error('加载评论失败:', error);
    }
}

// 初始化标签页功能
function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有活动状态
            tabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // 添加当前标签的活动状态
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            const targetPane = document.getElementById(tabId + 'Content');
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

// 初始化书籍详情页面的操作
function initializeDetailPageActions() {
    // 借阅按钮
    const borrowBtn = document.querySelector('.borrow-btn');
    if (borrowBtn) {
        borrowBtn.addEventListener('click', handleBorrow);
    }

    // 心愿单按钮
    const wishlistBtn = document.querySelector('.wishlist-btn');
    if (wishlistBtn) {
        wishlistBtn.addEventListener('click', handleWishlist);
    }

    // 分享按钮
    const shareBtn = document.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', handleShare);
    }

    // 添加评论功能
    initializeComments();
}

// 处理借阅
async function handleBorrow() {
    if (!checkLoginStatus()) {
        alert('Please login first');
        return;
    }

    const bookInfo = JSON.parse(sessionStorage.getItem('selectedBook'));
    if (!bookInfo) return;

    try {
        const response = await apiRequest('/api/borrow', {
            method: 'POST',
            body: JSON.stringify({
                userId: localStorage.getItem('userId'),
                bookId: bookInfo.bookId
            })
        });

        alert(`已成功借阅《${bookInfo.title}》\n到期时间: ${response.dueDate}\n请在"我的借阅"中查看详情`);
    } catch (error) {
        alert('借阅失败，请重试');
    }
}

// 处理心愿单
async function handleWishlist() {
    if (!checkLoginStatus()) {
        alert('please login first');
        return;
    }

    const bookInfo = JSON.parse(sessionStorage.getItem('selectedBook'));
    if (!bookInfo) return;

    const wishlistBtn = document.querySelector('.wishlist-btn');
    const icon = wishlistBtn.querySelector('i');
    const isInWishlist = icon.classList.contains('ri-heart-fill');

    try {
        if (isInWishlist) {
            await apiRequest(`/api/wishlist/${bookInfo.bookId}`, {
                method: 'DELETE'
            });
            icon.classList.replace('ri-heart-fill', 'ri-heart-line');
            alert('已从心愿单中移除');
        } else {
            await apiRequest('/api/wishlist', {
                method: 'POST',
                body: JSON.stringify({
                    userId: localStorage.getItem('userId'),
                    bookId: bookInfo.bookId
                })
            });
            icon.classList.replace('ri-heart-line', 'ri-heart-fill');
            alert('Added to wishlist');
        }
    } catch (error) {
        alert('操作失败，请重试');
    }
}

// 处理分享
async function handleShare() {
    const bookInfo = JSON.parse(sessionStorage.getItem('selectedBook'));
    if (!bookInfo) return;

    // 创建分享菜单
    const shareMenu = document.createElement('div');
    shareMenu.className = 'share-menu';
    shareMenu.innerHTML = `
        <div class="share-options">
            <button class="share-option" data-platform="wechat">
                <i class="ri-wechat-line"></i>
                <span>微信</span>
            </button>
            <button class="share-option" data-platform="weibo">
                <i class="ri-weibo-line"></i>
                <span>微博</span>
            </button>
            <button class="share-option" data-platform="qq">
                <i class="ri-qq-line"></i>
                <span>QQ</span>
            </button>
            <button class="share-option" data-platform="copy">
                <i class="ri-link"></i>
                <span>复制链接</span>
            </button>
        </div>
    `;

    document.body.appendChild(shareMenu);

    shareMenu.addEventListener('click', async (e) => {
        const option = e.target.closest('.share-option');
        if (option) {
            const platform = option.dataset.platform;
            await shareToPlaftorm(platform, bookInfo);
            shareMenu.remove();
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.share-menu') && !e.target.closest('.share-btn')) {
            shareMenu.remove();
        }
    }, { once: true });
}

// 分享到具体平台
async function shareToPlaftorm(platform, bookInfo) {
    try {
        await apiRequest('/api/social/share', {
            method: 'POST',
            body: JSON.stringify({
                userId: localStorage.getItem('userId'),
                bookId: bookInfo.bookId,
                platform: platform
            })
        });

        const shareUrl = window.location.href;
        const shareTitle = `推荐好书：《${bookInfo.title}》`;
        const shareText = `我在电子书借阅系统发现了一本好书：《${bookInfo.title}》，快来看看吧！`;

        switch (platform) {
            case 'wechat':
                alert('请打开微信扫描二维码分享');
                break;
            case 'weibo':
                window.open(`http://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`);
                break;
            case 'qq':
                window.open(`http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}&desc=${encodeURIComponent(shareText)}`);
                break;
            case 'copy':
                navigator.clipboard.writeText(shareUrl).then(() => {
                    alert('链接已复制到剪贴板');
                });
                break;
        }
    } catch (error) {
        alert('分享失败，请重试');
    }
}

// 初始化评论功能
function initializeComments() {
    const reviewsDiv = document.getElementById('bookReviews');
    if (!reviewsDiv) return;

    // 添加评论表单
    const commentForm = document.createElement('div');
    commentForm.className = 'comment-form';
    commentForm.innerHTML = `
        <h3>发表评论</h3>
        <div class="rating-input">
            <span>评分：</span>
            <div class="star-rating">
                <i class="ri-star-line" data-rating="1"></i>
                <i class="ri-star-line" data-rating="2"></i>
                <i class="ri-star-line" data-rating="3"></i>
                <i class="ri-star-line" data-rating="4"></i>
                <i class="ri-star-line" data-rating="5"></i>
            </div>
        </div>
        <textarea placeholder="写下你的评论..."></textarea>
        <button class="submit-comment">发表评论</button>
    `;

    // 在评论列表前插入评论表单
    const reviewsList = reviewsDiv.querySelector('.review-item');
    reviewsDiv.insertBefore(commentForm, reviewsList);

    // 处理星级评分
    const starRating = commentForm.querySelector('.star-rating');
    let currentRating = 0;

    starRating.addEventListener('mouseover', (e) => {
        const star = e.target.closest('[data-rating]');
        if (!star) return;

        const rating = parseInt(star.dataset.rating);
        updateStars(rating, true);
    });

    starRating.addEventListener('mouseout', () => {
        updateStars(currentRating);
    });

    starRating.addEventListener('click', (e) => {
        const star = e.target.closest('[data-rating]');
        if (!star) return;

        currentRating = parseInt(star.dataset.rating);
        updateStars(currentRating);
    });

    // 提交评论
    const submitBtn = commentForm.querySelector('.submit-comment');
    submitBtn.addEventListener('click', () => {
        const comment = commentForm.querySelector('textarea').value;

        if (!checkLoginStatus()) {
            alert('please login first');
            return;
        }

        if (currentRating === 0) {
            alert('请选择评分');
            return;
        }

        if (!comment.trim()) {
            alert('请输入评论内容');
            return;
        }

        // 添加新评论到列表
        addNewComment(comment, currentRating);

        // 重置表单
        commentForm.querySelector('textarea').value = '';
        currentRating = 0;
        updateStars(0);
    });
}

// 更新星级显示
function updateStars(rating, isHover = false) {
    const stars = document.querySelectorAll('.star-rating i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.className = isHover ? 'ri-star-fill' : 'ri-star-fill';
        } else {
            star.className = 'ri-star-line';
        }
    });
}

// 添加新评论
function addNewComment(comment, rating) {
    const reviewsDiv = document.getElementById('bookReviews');
    const newComment = document.createElement('div');
    newComment.className = 'review-item';
    newComment.innerHTML = `
        <div class="review-header">
            <span class="reviewer">我</span>
            <span class="review-rating">${rating}.0</span>
        </div>
        <p>${comment}</p>
    `;

    // 将新评论插入到评论列表的开头
    const firstReview = reviewsDiv.querySelector('.review-item');
    reviewsDiv.insertBefore(newComment, firstReview);
}

// 检查登录状态
function checkLoginStatus() {
    return localStorage.getItem('token') !== null;
}
