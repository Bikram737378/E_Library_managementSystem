const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: false,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: config.EMAIL_FROM,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error: ', error);
    throw error;
  }
};

const sendIssueEmail = async (user, book, dueDate) => {
  const subject = 'Book Issued Successfully';
  const html = `
    <h2>Hello ${user.name},</h2>
    <p>You have successfully issued the book: <strong>${book.title}</strong></p>
    <p>Due Date: ${new Date(dueDate).toLocaleDateString()}</p>
    <p>Please return the book on or before the due date to avoid fines.</p>
    <p>Happy Reading!</p>
  `;
  return sendEmail(user.email, subject, html);
};

const sendReturnEmail = async (user, book, fine = 0) => {
  const subject = 'Book Returned Successfully';
  const html = `
    <h2>Hello ${user.name},</h2>
    <p>You have successfully returned the book: <strong>${book.title}</strong></p>
    <p>Return Date: ${new Date().toLocaleDateString()}</p>
    ${fine > 0 ? `<p>Fine Paid: ₹${fine}</p>` : ''}
    <p>Thank you for using our library!</p>
  `;
  return sendEmail(user.email, subject, html);
};

const sendReminderEmail = async (user, book, dueDate, fine) => {
  const subject = 'Book Return Reminder';
  const html = `
    <h2>Hello ${user.name},</h2>
    <p>This is a reminder that the book <strong>${book.title}</strong> is overdue.</p>
    <p>Due Date was: ${new Date(dueDate).toLocaleDateString()}</p>
    <p>Current Fine: ₹${fine}</p>
    <p>Please return the book immediately to avoid additional fines.</p>
  `;
  return sendEmail(user.email, subject, html);
};

module.exports = {
  sendIssueEmail,
  sendReturnEmail,
  sendReminderEmail,
};