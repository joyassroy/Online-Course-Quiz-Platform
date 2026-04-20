const express = require('express');
const router = express.Router();
const { createCategory, getAllCategories, updateCategory } = require('../controllers/categoryController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// সব রাউট সুরক্ষিত (শুধুমাত্র অ্যাডমিন এক্সেস করতে পারবে)
router.use(verifyToken, isAdmin);

// Routes
router.post('/', createCategory);           // নতুন ক্যাটাগরি তৈরি
router.get('/', getAllCategories);          // সব ক্যাটাগরি দেখা
router.put('/:id', updateCategory);         // ক্যাটাগরি আপডেট বা ইনঅ্যাকটিভ করা (Soft Delete)

module.exports = router;