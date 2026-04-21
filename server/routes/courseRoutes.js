const express = require('express');
const router = express.Router();

// 🌟 সব কন্ট্রোলার ফাংশন ইমপোর্ট করা হলো
const { 
    createCourse, 
    getAllCourses, 
    updateCourseStatus, 
    deleteCourse 
} = require('../controllers/courseController'); 

const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// 🔒 এই ফাইলের সব রাউটের জন্য টোকেন এবং অ্যাডমিন ভেরিফিকেশন
router.use(verifyToken, isAdmin);

// 📌 Course Routes
router.post('/', createCourse);
router.get('/', getAllCourses);

// 🌟 নতুন Oversight Routes
router.put('/:id/status', updateCourseStatus); // কোর্স অ্যাপ্রুভ/রিজেক্ট/আনপাবলিশ করার জন্য
router.delete('/:id', deleteCourse);           // কোর্স ডিলিট করার জন্য

module.exports = router;