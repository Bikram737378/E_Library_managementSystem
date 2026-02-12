const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
const User = require('../models/User');
const Book = require('../models/Book');
const Loan = require('../models/Loan');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-library');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await Loan.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@library.com',
      password: adminPassword,
      role: 'admin',
      isActive: true
    });
    console.log('✅ Admin created:', admin.email);

    // Create student
    const studentPassword = await bcrypt.hash('student123', 10);
    const student = await User.create({
      name: 'John Student',
      email: 'student@library.com',
      password: studentPassword,
      role: 'student',
      studentId: 'STU001',
      isActive: true
    });
    console.log('✅ Student created:', student.email, 'ID:', student.studentId);

    // Create books
    const books = await Book.create([
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        isbn: '9780743273565',
        category: 'Fiction',
        totalCopies: 5,
        availableCopies: 5,
        location: 'A1-01',
        qrCode: 'sample-qr-1'
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '9780451524935',
        category: 'Science Fiction',
        totalCopies: 3,
        availableCopies: 3,
        location: 'B2-15',
        qrCode: 'sample-qr-2'
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '9780061120084',
        category: 'Fiction',
        totalCopies: 4,
        availableCopies: 4,
        location: 'A1-23',
        qrCode: 'sample-qr-3'
      }
    ]);
    console.log(`✅ Created ${books.length} books`);

    console.log('\n🎉 SEED COMPLETE!');
    console.log('=================================');
    console.log('Admin:     admin@library.com / admin123');
    console.log('Student:   student@library.com / student123');
    console.log('Student ID: STU001');
    console.log('Books:     The Great Gatsby, 1984, To Kill a Mockingbird');
    console.log('=================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();