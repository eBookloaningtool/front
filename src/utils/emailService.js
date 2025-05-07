/**
 * 电子书借阅系统邮件通知服务
 */

import axios from 'axios';

/**
 * 发送邮件通知
 * @param {string} type - 邮件类型
 * @param {Object} data - 邮件数据
 */
export const sendEmailNotification = async (type, data) => {
  try {
    const emailData = prepareEmailData(type, data);
    // 实际项目中，这里会调用后端API发送邮件
    const response = await axios.post('/api/notifications/email', emailData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Send email notification failed:', error);
    throw error;
  }
};

/**
 * 准备邮件数据
 * @param {string} type - 邮件类型
 * @param {Object} data - 邮件数据
 * @returns {Object} - 格式化的邮件数据
 */
const prepareEmailData = (type, data) => {
  const user = data.user || {};
  const book = data.book || {};

  const templates = {
    // 用户注册成功邮件
    'register': {
      subject: 'Welcome to the e-book borrowing system',
      content: `
        <h2>Welcome ${user.name}!</h2>
        <p>Thank you for registering in the e-book borrowing system. You can now browse and borrow thousands of e-books.</p>
        <p>Account: ${user.email}</p>
        <p>If you have any questions, please contact our customer service team.</p>
      `
    },

    // 借阅成功邮件
    'borrow': {
      subject: 'Borrow confirmation - e-book borrowing system',
      content: `
        <h2>Borrow confirmation</h2>
        <p>Dear ${user.name},</p>
        <p>You have successfully borrowed the following e-book:</p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #eee;">
          <p><strong>Title:</strong> ${book.title}</p>
          <p><strong>Author:</strong> ${book.author}</p>
          <p><strong>Borrow date:</strong> ${data.borrowDate}</p>
          <p><strong>Return date:</strong> ${data.dueDate}</p>
        </div>
        <p>You can view and manage your borrowed books in the "My Borrowed Books" page.</p>
      `
    },

    // 借阅即将到期邮件
    'due_soon': {
      subject: 'Borrowing due soon reminder - e-book borrowing system',
      content: `
        <h2>Borrowing due soon reminder</h2>
        <p>Dear ${user.name},</p>
        <p>The following e-book you borrowed is due to expire:</p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #eee;">
          <p><strong>Title:</strong> ${book.title}</p>
          <p><strong>Author:</strong> ${book.author}</p>
          <p><strong>Due date:</strong> ${data.dueDate} (3 days later)</p>
        </div>
        <p>If you want to continue reading, please login to the system to renew the borrowing.</p>
        <p><a href="${data.renewLink}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">立即续借</a></p>
      `
    },

    // 借阅到期邮件
    'expired': {
      subject: 'Borrowing expired - e-book borrowing system',
      content: `
        <h2>Borrowing expired</h2>
        <p>Dear ${user.name},</p>
        <p>The following e-book you borrowed has expired:</p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #eee;">
          <p><strong>Title:</strong> ${book.title}</p>
          <p><strong>Author:</strong> ${book.author}</p>
          <p><strong>Due date:</strong> ${data.dueDate}</p>
        </div>
        <p>The book has been removed from your borrowed list.</p>
        <p>If you want to continue reading, you can borrow it again.</p>
      `
    },

    // 归还确认邮件
    'return': {
      subject: 'Return confirmation - e-book borrowing system',
      content: `
        <h2>Return confirmation</h2>
        <p>Dear ${user.name},</p>
        <p>You have successfully returned the following e-book:</p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #eee;">
          <p><strong>Title:</strong> ${book.title}</p>
          <p><strong>Author:</strong> ${book.author}</p>
          <p><strong>Borrow date:</strong> ${data.borrowDate}</p>
          <p><strong>Return date:</strong> ${data.returnDate}</p>
        </div>
        <p>Thank you for using the e-book borrowing system.</p>
      `
    },

    // 密码重置邮件
    'password_reset': {
      subject: 'Password reset - e-book borrowing system',
      content: `
        <h2>Password reset</h2>
        <p>Dear ${user.name},</p>
        <p>Your new random password is: <strong>${data.newPassword}</strong></p>
        <p>Please use this password to login to the system and change it to your own password as soon as possible.</p>
      `
    },
  };

  // 获取对应类型的模板
  const template = templates[type] || {
    subject: 'e-book borrowing system notification',
    content: '<p>System notification</p>'
  };

  return {
    to: user.email,
    subject: template.subject,
    content: template.content,
    type: type,
    data: data
  };
};

/**
 * 检查是否有即将到期的书籍并发送提醒
 * 此函数应该由定时任务调用，例如每天凌晨
 */
export const checkAndSendDueSoonNotifications = async () => {
  try {
    // 获取所有用户的借阅信息
    // 实际项目中，这里应该由后端服务完成
    const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
    const now = new Date();

    for (const book of borrowedBooks) {
      const dueDate = new Date(book.dueDate);
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      // 如果还有3天到期，发送提醒
      if (diffDays === 3) {
        // 获取用户信息
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        // 发送提醒邮件
        await sendEmailNotification('due_soon', {
          user: user,
          book: book,
          dueDate: book.dueDate,
          renewLink: `${window.location.origin}/mybooks`
        });
      }
    }
  } catch (error) {
    console.error('Check due soon notifications failed:', error);
  }
};