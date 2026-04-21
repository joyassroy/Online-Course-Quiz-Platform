require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. Basic Middleware
// ==========================================
app.use(cors()); // Next.js ফ্রন্টএন্ড থেকে API কল করার জন্য
app.use(express.json()); // JSON ডেটা রিড করার জন্য
app.use('/uploads', express.static('uploads')); // ফাইলগুলো পাবলিকলি এক্সেস করার জন্য

// ==========================================
// 2. Database Connection Pool
// ==========================================
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    socketPath: process.env.DB_SOCKET || '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock', // Mac XAMPP Socket
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test Database Connection
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL Database connected successfully!');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

// ==========================================
// 3. Custom DB Middleware (MUST be before Routes)
// ==========================================
// Make pool available to all routes via req.db
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// ==========================================
// 4. Mount Routes
// ==========================================
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const courseRoutes = require('./routes/courseRoutes');
const quizRoutes = require('./routes/quizRoutes');
const questionRoutes = require('./routes/questionRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/courses', courseRoutes); // New
app.use('/api/admin/quizzes', quizRoutes);   // New
app.use('/api/admin/questions', questionRoutes);
app.use('/api/student', studentRoutes);

//const categoryRoutes = require('./routes/categoryRoutes');
//app.use('/api/admin/categories', categoryRoutes);

// Basic Health Check Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the OCQP API Server!' });
});

// ==========================================
// 5. Server Initialization
// ==========================================
app.listen(PORT, '127.0.0.1',() => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

module.exports = pool;