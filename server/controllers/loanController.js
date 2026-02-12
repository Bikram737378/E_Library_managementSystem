const asyncHandler = require('express-async-handler');
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const User = require('../models/User');
const { loanSchema } = require('../utils/validation');
const logAudit = require('../utils/auditLogger');
const { sendIssueEmail, sendReturnEmail } = require('../utils/emailService');
const config = require('../config/config');

// @desc    Issue book
// @route   POST /api/loans
// @access  Private/Admin
const issueBook = asyncHandler(async (req, res) => {
  console.log('\n========== ISSUE BOOK ==========');
  console.log('📚 Request body:', req.body);
  console.log('👤 Admin:', req.user?.email);
  console.log('================================\n');

  // Validate request body
  const { error } = loanSchema.validate(req.body);
  if (error) {
    console.log('❌ Validation error:', error.details[0].message);
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const { bookId, studentId, dueDate } = req.body;

  // ---------- 1. CHECK BOOK ----------
  const book = await Book.findById(bookId);
  if (!book) {
    console.log('❌ Book not found with ID:', bookId);
    res.status(404);
    throw new Error('Book not found');
  }
  console.log(`✅ Book found: ${book.title} (Available: ${book.availableCopies})`);

  if (book.availableCopies <= 0) {
    res.status(400);
    throw new Error('No copies available for this book');
  }

  // ---------- 2. CHECK STUDENT (BY STUDENTID FIELD, NOT _ID) ----------
  console.log(`🔍 Searching for student with studentId: "${studentId}"`);
  const student = await User.findOne({
    studentId: studentId,  // ← CRITICAL FIX: search by custom studentId field
    role: 'student',
    isActive: true
  });

  if (!student) {
    console.log('❌ Student not found with studentId:', studentId);
    
    // Debug: show all students in DB to help troubleshooting
    const allStudents = await User.find({ role: 'student' })
      .select('name email studentId _id');
    console.log('📋 All registered students:');
    allStudents.forEach(s => {
      console.log(`   - ${s.studentId || 'NO ID'}: ${s.name} (${s.email})`);
    });

    res.status(404);
    throw new Error(`Student not found with ID: ${studentId}`);
  }
  console.log(`✅ Student found: ${student.name} (${student.email})`);
  console.log(`   MongoDB _id: ${student._id}, studentId: ${student.studentId}`);

  // ---------- 3. CHECK FOR EXISTING ACTIVE LOAN ----------
  const existingLoan = await Loan.findOne({
    book: book._id,
    student: student._id,  // ← use MongoDB _id, not the string studentId
    status: { $in: ['issued', 'overdue'] }
  });

  if (existingLoan) {
    console.log('❌ Existing active loan found:', existingLoan._id);
    res.status(400);
    throw new Error('Student already has this book issued');
  }

  // ---------- 4. CALCULATE DUE DATE ----------
  const dueDateValue = dueDate
    ? new Date(dueDate)
    : new Date(Date.now() + config.DEFAULT_BORROW_DAYS * 24 * 60 * 60 * 1000);

  // ---------- 5. CREATE LOAN ----------
  const loan = await Loan.create({
    book: book._id,
    student: student._id,  // ← store the MongoDB ObjectId reference
    issueDate: new Date(),
    dueDate: dueDateValue,
    status: 'issued',
    fineAmount: 0
  });
  console.log(`✅ Loan created with ID: ${loan._id}`);

  // ---------- 6. UPDATE BOOK AVAILABILITY ----------
  book.availableCopies -= 1;
  await book.save();
  console.log(`✅ Book availability updated. Remaining copies: ${book.availableCopies}`);

  // ---------- 7. SEND EMAIL (NON-BLOCKING) ----------
  try {
    await sendIssueEmail(student, book, dueDateValue);
    console.log('📧 Issue email sent');
  } catch (emailError) {
    console.error('❌ Email sending failed:', emailError.message);
    // Don't throw – email failure should not break the transaction
  }

  // ---------- 8. AUDIT LOG ----------
  await logAudit('BOOK_ISSUED', req.user._id, {
    loanId: loan._id,
    bookId: book._id,
    studentId: student._id,
    studentNumber: student.studentId,
    dueDate: dueDateValue
  });
  console.log('📝 Audit log created');

  // ---------- 9. RETURN POPULATED LOAN ----------
  const populatedLoan = await Loan.findById(loan._id)
    .populate('book', 'title author isbn')
    .populate('student', 'name email studentId');

  console.log('✅ Book issued successfully!\n');

  res.status(201).json({
    success: true,
    data: populatedLoan
  });
});

// @desc    Return book
// @route   PUT /api/loans/:id/return
// @access  Private/Admin
const returnBook = asyncHandler(async (req, res) => {
  console.log('\n========== RETURN BOOK ==========');
  console.log('📚 Loan ID:', req.params.id);
  console.log('👤 Admin:', req.user?.email);
  console.log('================================\n');

  const loan = await Loan.findById(req.params.id)
    .populate('book')
    .populate('student');

  if (!loan) {
    console.log('❌ Loan not found with ID:', req.params.id);
    res.status(404);
    throw new Error('Loan record not found');
  }

  if (loan.status === 'returned') {
    console.log('❌ Book already returned');
    res.status(400);
    throw new Error('Book already returned');
  }

  // ---------- CALCULATE FINE IF OVERDUE ----------
  const today = new Date();
  const dueDate = new Date(loan.dueDate);
  let fineAmount = 0;

  if (today > dueDate) {
    const daysLate = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
    fineAmount = daysLate * config.FINE_PER_DAY;
    console.log(`⚠️ Book overdue by ${daysLate} days, fine: ₹${fineAmount}`);
  }

  // ---------- UPDATE LOAN ----------
  loan.returnDate = today;
  loan.status = 'returned';
  loan.fineAmount = fineAmount;
  await loan.save();
  console.log('✅ Loan updated');

  // ---------- UPDATE BOOK AVAILABILITY ----------
  loan.book.availableCopies += 1;
  await loan.book.save();
  console.log(`✅ Book availability updated. Available copies: ${loan.book.availableCopies}`);

  // ---------- SEND EMAIL (NON-BLOCKING) ----------
  try {
    await sendReturnEmail(loan.student, loan.book, fineAmount);
    console.log('📧 Return email sent');
  } catch (emailError) {
    console.error('❌ Email sending failed:', emailError.message);
  }

  // ---------- AUDIT LOG ----------
  await logAudit('BOOK_RETURNED', req.user._id, {
    loanId: loan._id,
    bookId: loan.book._id,
    studentId: loan.student._id,
    fineAmount
  });
  console.log('📝 Audit log created');

  console.log('✅ Book returned successfully!\n');

  res.json({
    success: true,
    data: loan
  });
});

// @desc    Get all loans (with pagination)
// @route   GET /api/loans
// @access  Private/Admin
const getLoans = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const status = req.query.status;

  const query = status ? { status } : {};

  const count = await Loan.countDocuments(query);
  const loans = await Loan.find(query)
    .populate('book', 'title author isbn')
    .populate('student', 'name email studentId')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: loans,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Get current student's loans
// @route   GET /api/loans/my-loans
// @access  Private/Student
const getMyLoans = asyncHandler(async (req, res) => {
  const loans = await Loan.find({ student: req.user._id })
    .populate('book', 'title author isbn location')
    .sort({ createdAt: -1 });

  const totalFine = loans.reduce((sum, loan) => sum + loan.fineAmount, 0);

  res.json({
    success: true,
    data: {
      loans,
      totalFine
    }
  });
});

module.exports = {
  issueBook,
  returnBook,
  getLoans,
  getMyLoans
};