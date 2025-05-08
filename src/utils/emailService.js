/**
 * E-book borrowing system email notification service
 */

import axios from 'axios';

/**
 * Send email notification
 * @param {string} type - Email type
 * @param {Object} data - Email data
 */
export const sendEmailNotification = async (type, data) => {
  try {
    const emailData = prepareEmailData(type, data);
    // In actual projects, this will call the backend API to send emails
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
 * Prepare email data
 * @param {string} type - Email type
 * @param {Object} data - Email data
 * @returns {Object} - Formatted email data
 */
const prepareEmailData = (type, data) => {
  const user = data.user || {};
  const book = data.book || {};

  const templates = {
    // User registration success email
    'register': {
      subject: 'Welcome to the e-book borrowing system',
      content: `
        <h2>Welcome ${user.name}!</h2>
        <p>Thank you for registering in the e-book borrowing system. You can now browse and borrow thousands of e-books.</p>
        <p>Account: ${user.email}</p>
        <p>If you have any questions, please contact our customer service team.</p>
      `
    },

    // Borrowing success email
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

    // Borrowing due soon reminder email
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

    // Borrowing expired email
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

    // Return confirmation email
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

    // Password reset email
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

  // Get the corresponding type template
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
 * Check if there are books that are due soon and send reminders
 * This function should be called by a scheduled task, such as daily at midnight
 */
export const checkAndSendDueSoonNotifications = async () => {
  try {
    // Get all users' borrowing information
    // In actual projects, this should be completed by the backend service
    const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
    const now = new Date();

    for (const book of borrowedBooks) {
      const dueDate = new Date(book.dueDate);
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      // If there are 3 days left, send a reminder
      if (diffDays === 3) {
        // Get user information
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        // Send reminder email
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
