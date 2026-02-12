const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  studentId: Joi.string().when('role', {
    is: 'student',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  role: Joi.string().valid('admin', 'student').default('student'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const bookSchema = Joi.object({
  title: Joi.string().required().min(1).max(200),
  author: Joi.string().required().min(1).max(100),
  isbn: Joi.string().required().pattern(/^(?:\d[\d-]*\d|\d)$/),
  category: Joi.string().required(),
  totalCopies: Joi.number().integer().min(0).required(),
  availableCopies: Joi.number().integer().min(0),
  location: Joi.string().required(),
});

const loanSchema = Joi.object({
  bookId: Joi.string().required(),
  studentId: Joi.string().required(),
  dueDate: Joi.date().greater('now'),
});

module.exports = {
  registerSchema,
  loginSchema,
  bookSchema,
  loanSchema,
};