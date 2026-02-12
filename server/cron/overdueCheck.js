const cron = require('node-cron');
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');
const { sendReminderEmail } = require('../utils/emailService');
const logAudit = require('../utils/auditLogger');
const config = require('../config/config');

const checkOverdueLoans = cron.schedule('0 0 * * *', async () => {
  console.log('Running overdue loans check...');
  
  try {
    const overdueLoans = await Loan.find({
      status: 'issued',
      dueDate: { $lt: new Date() }
    })
      .populate('book')
      .populate('student');

    console.log(`Found ${overdueLoans.length} overdue loans`);

    for (const loan of overdueLoans) {
      loan.status = 'overdue';
      
      const daysLate = Math.ceil((new Date() - loan.dueDate) / (1000 * 60 * 60 * 24));
      loan.fineAmount = daysLate * config.FINE_PER_DAY;
      
      await loan.save();

      await sendReminderEmail(
        loan.student,
        loan.book,
        loan.dueDate,
        loan.fineAmount
      );

      await logAudit('OVERDUE_AUTO_UPDATE', loan.student._id, {
        loanId: loan._id,
        bookId: loan.book._id,
        daysLate,
        fineAmount: loan.fineAmount,
      });
    }

    console.log('Overdue check completed');
  } catch (error) {
    console.error('Overdue check error:', error);
  }
});

module.exports = {
  checkOverdueLoans,
};