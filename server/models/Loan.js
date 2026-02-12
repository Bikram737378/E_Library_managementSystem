const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
  },
  fineAmount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['issued', 'returned', 'overdue'],
    default: 'issued',
    index: true,
  },
}, {
  timestamps: true,
});

loanSchema.index({ status: 1, dueDate: 1 });
loanSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model('Loan', loanSchema);