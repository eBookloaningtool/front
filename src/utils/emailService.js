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
    console.error('发送邮件通知失败:', error);
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
      subject: '欢迎加入电子书借阅系统',
      content: `
        <h2>欢迎 ${user.name}!</h2>
        <p>感谢您注册电子书借阅系统。您现在可以浏览和借阅数千本电子书。</p>
        <p>账号: ${user.email}</p>
        <p>如有任何问题，请联系我们的客服团队。</p>
      `
    },
    
    // 借阅成功邮件
    'borrow': {
      subject: '借阅确认 - 电子书借阅系统',
      content: `
        <h2>借阅确认</h2>
        <p>亲爱的 ${user.name},</p>
        <p>您已成功借阅以下电子书:</p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #eee;">
          <p><strong>书名:</strong> ${book.title}</p>
          <p><strong>作者:</strong> ${book.author}</p>
          <p><strong>借阅日期:</strong> ${data.borrowDate}</p>
          <p><strong>归还日期:</strong> ${data.dueDate}</p>
        </div>
        <p>您可以在"我的借阅"页面查看和管理您的借阅书籍。</p>
      `
    },
    
    // 借阅即将到期邮件
    'due_soon': {
      subject: '借阅即将到期提醒 - 电子书借阅系统',
      content: `
        <h2>借阅即将到期</h2>
        <p>亲爱的 ${user.name},</p>
        <p>您借阅的以下电子书即将到期:</p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #eee;">
          <p><strong>书名:</strong> ${book.title}</p>
          <p><strong>作者:</strong> ${book.author}</p>
          <p><strong>到期日期:</strong> ${data.dueDate} (3天后)</p>
        </div>
        <p>如果您希望继续阅读，请登录系统进行续借操作。</p>
        <p><a href="${data.renewLink}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">立即续借</a></p>
      `
    },
    
    // 借阅到期邮件
    'expired': {
      subject: '借阅已到期 - 电子书借阅系统',
      content: `
        <h2>借阅已到期</h2>
        <p>亲爱的 ${user.name},</p>
        <p>您借阅的以下电子书已经到期:</p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #eee;">
          <p><strong>书名:</strong> ${book.title}</p>
          <p><strong>作者:</strong> ${book.author}</p>
          <p><strong>到期日期:</strong> ${data.dueDate}</p>
        </div>
        <p>该书已从您的借阅列表中移除。</p>
        <p>如果您希望继续阅读，可以重新借阅此书。</p>
      `
    },
    
    // 归还确认邮件
    'return': {
      subject: '归还确认 - 电子书借阅系统',
      content: `
        <h2>归还确认</h2>
        <p>亲爱的 ${user.name},</p>
        <p>您已成功归还以下电子书:</p>
        <div style="margin: 20px 0; padding: 15px; border: 1px solid #eee;">
          <p><strong>书名:</strong> ${book.title}</p>
          <p><strong>作者:</strong> ${book.author}</p>
          <p><strong>借阅日期:</strong> ${data.borrowDate}</p>
          <p><strong>归还日期:</strong> ${data.returnDate}</p>
        </div>
        <p>感谢您使用电子书借阅系统。</p>
      `
    },
    
    // 密码重置邮件
    'password_reset': {
      subject: '密码重置 - 电子书借阅系统',
      content: `
        <h2>密码重置</h2>
        <p>亲爱的 ${user.name},</p>
        <p>您的新随机密码是: <strong>${data.newPassword}</strong></p>
        <p>请使用此密码登录系统，并尽快在个人设置中修改为您自己的密码。</p>
      `
    },
  };
  
  // 获取对应类型的模板
  const template = templates[type] || {
    subject: '电子书借阅系统通知',
    content: '<p>系统通知</p>'
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
    console.error('检查到期书籍失败:', error);
  }
}; 