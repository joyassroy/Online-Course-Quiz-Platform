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
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false 
    }
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
app.use('/api/instructor', require('./routes/instructorRoutes'));
//const categoryRoutes = require('./routes/categoryRoutes');
//app.use('/api/admin/categories', categoryRoutes);

// Basic Health Check Route (ব্রাউজারে লিংকে ঢুকলে এটা দেখাবে)
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the OCQP API Server!' });
});

// 🌟 New: Ping Route for cron-job.org (সার্ভার সতেজ রাখার জন্য)
app.get('/ping', (req, res) => {
    res.status(200).send('Server is awake! 🚀');
});
// Database Keep-Alive / Health Check Route
app.get('/api/health', async (req, res) => {
    try {
        // ডাটাবেসকে জাগিয়ে রাখার জন্য সবচেয়ে হালকা একটি কুয়েরি
        await req.db.query('SELECT 1'); 
        
        res.status(200).json({ 
            success: true, 
            message: '🚀 Backend and Aiven Database are fully awake and running!' 
        });
    } catch (error) {
        console.error('Health Check Failed:', error);
        res.status(500).json({ success: false, message: 'Database is sleeping or down.' });
    }
});

// ==========================================
// 5. Server Initialization
// ==========================================
// ⚠️ Update: Removed '127.0.0.1' so Render can access it globally
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

module.exports = pool;