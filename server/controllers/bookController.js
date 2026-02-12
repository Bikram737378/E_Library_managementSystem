const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');
const { bookSchema } = require('../utils/validation');
const generateQRCode = require('../utils/generateQR');
const logAudit = require('../utils/auditLogger');

const addBook = asyncHandler(async (req, res) => {
  const { error } = bookSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const { title, author, isbn, category, totalCopies, location } = req.body;

  const bookExists = await Book.findOne({ isbn });
  if (bookExists) {
    res.status(400);
    throw new Error('Book with this ISBN already exists');
  }

  const qrCode = await generateQRCode(null, isbn, title);

  const book = await Book.create({
    title,
    author,
    isbn,
    category,
    totalCopies,
    availableCopies: totalCopies,
    location,
    qrCode,
  });

  await logAudit('BOOK_ADDED', req.user._id, {
    bookId: book._id,
    title: book.title,
    isbn: book.isbn,
  });

  res.status(201).json({
    success: true,
    data: book,
  });
});

const getBooks = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const search = req.query.search || '';

  const searchQuery = search
    ? {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { isbn: { $regex: search, $options: 'i' } },
        ],
      }
    : {};

  const count = await Book.countDocuments(searchQuery);
  const books = await Book.find(searchQuery)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: books,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  res.json({
    success: true,
    data: book,
  });
});

const updateBook = asyncHandler(async (req, res) => {
  let book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  const { totalCopies, ...updateData } = req.body;

  if (totalCopies !== undefined) {
    const difference = totalCopies - book.totalCopies;
    updateData.totalCopies = totalCopies;
    updateData.availableCopies = Math.max(0, book.availableCopies + difference);
  }

  book = await Book.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  await logAudit('BOOK_UPDATED', req.user._id, {
    bookId: book._id,
    title: book.title,
    updates: updateData,
  });

  res.json({
    success: true,
    data: book,
  });
});

const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  await book.deleteOne();

  await logAudit('BOOK_DELETED', req.user._id, {
    bookId: book._id,
    title: book.title,
    isbn: book.isbn,
  });

  res.json({
    success: true,
    message: 'Book removed',
  });
});

module.exports = {
  addBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
};