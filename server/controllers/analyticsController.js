const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');
const User = require('../models/User');
const Loan = require('../models/Loan');

const getDashboardStats = asyncHandler(async (req, res) => {
  const totalBooks = await Book.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
  const activeLoans = await Loan.countDocuments({ status: 'issued' });
  const overdueLoans = await Loan.countDocuments({ 
    status: 'overdue',
    dueDate: { $lt: new Date() }
  });
  
  const finesResult = await Loan.aggregate([
    { $match: { status: 'returned', fineAmount: { $gt: 0 } } },
    { $group: { _id: null, total: { $sum: '$fineAmount' } } }
  ]);
  const totalFinesCollected = finesResult.length > 0 ? finesResult[0].total : 0;

  const mostBorrowed = await Loan.aggregate([
    { $group: { _id: '$book', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'book'
      }
    },
    { $unwind: '$book' },
    {
      $project: {
        _id: '$book._id',
        title: '$book.title',
        author: '$book.author',
        count: 1
      }
    }
  ]);

  const monthlyStats = await Loan.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1)
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        issued: {
          $sum: { $cond: [{ $eq: ['$status', 'issued'] }, 1, 0] }
        },
        returned: {
          $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.json({
    success: true,
    data: {
      totalBooks,
      totalStudents,
      activeLoans,
      overdueLoans,
      totalFinesCollected,
      mostBorrowed,
      monthlyStats,
    },
  });
});

const getStudentStats = asyncHandler(async (req, res) => {
  const loans = await Loan.find({ student: req.user._id });
  
  const totalBorrowed = loans.length;
  const currentlyBorrowed = loans.filter(l => l.status === 'issued').length;
  const totalFines = loans.reduce((sum, l) => sum + l.fineAmount, 0);
  const pendingFines = loans
    .filter(l => l.status === 'issued' || l.status === 'overdue')
    .reduce((sum, l) => sum + l.fineAmount, 0);

  res.json({
    success: true,
    data: {
      totalBorrowed,
      currentlyBorrowed,
      totalFines,
      pendingFines,
    },
  });
});

module.exports = {
  getDashboardStats,
  getStudentStats,
};