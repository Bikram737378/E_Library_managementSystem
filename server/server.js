const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database connection
const connectDB = require('./config/db');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const userRoutes = require('./routes/userRoutes');          // 👈 NEW
const analyticsRoutes = require('./routes/analyticsRoutes');
const auditRoutes = require('./routes/auditRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import cron jobs
const { checkOverdueLoans } = require('./cron/overdueCheck');

// Connect to MongoDB
connectDB();

const app = express();

// ============ GLOBAL MIDDLEWARE ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting – apply to all /api routes
app.use('/api/', apiLimiter);

// ============ ROUTE REGISTRATION ============
console.log('\n📋 REGISTERING API ROUTES...');

app.use('/api/auth', authRoutes);
console.log('✅ /api/auth');

app.use('/api/books', bookRoutes);
console.log('✅ /api/books');

app.use('/api/loans', loanRoutes);
console.log('✅ /api/loans');

app.use('/api/users', userRoutes);          // 👈 NEW – student management
console.log('✅ /api/users');

app.use('/api/analytics', analyticsRoutes);
console.log('✅ /api/analytics');

app.use('/api/audit', auditRoutes);
console.log('✅ /api/audit');

// ============ HEALTH CHECK ============
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ============ 404 HANDLER – UNDEFINED ROUTES ============
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// ============ GLOBAL ERROR HANDLER ============
app.use(errorHandler);

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  console.log(`🔄 MongoDB: ${process.env.MONGO_URI || 'mongodb://localhost:27017/smart-library'}\n`);
});

// ============ START CRON JOBS ============
checkOverdueLoans.start();

// ============ UNHANDLED REJECTIONS ============
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  console.error(err.stack);
  server.close(() => process.exit(1));
});

module.exports = app;