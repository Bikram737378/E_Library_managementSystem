const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a book title'],
    trim: true,
    index: true,
  },
  author: {
    type: String,
    required: [true, 'Please add an author'],
    trim: true,
  },
  isbn: {
    type: String,
    required: [true, 'Please add ISBN'],
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true,
  },
  totalCopies: {
    type: Number,
    required: true,
    min: [0, 'Total copies cannot be negative'],
  },
  availableCopies: {
    type: Number,
    required: true,
    min: [0, 'Available copies cannot be negative'],
  },
  location: {
    type: String,
    required: [true, 'Please add shelf location'],
    trim: true,
  },
  qrCode: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

bookSchema.index({ title: 'text', author: 'text', isbn: 'text' });

module.exports = mongoose.model('Book', bookSchema);