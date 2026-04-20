const express = require('express');
const router = express.Router();

// ১. কন্ট্রোলার থেকে সব প্রয়োজনীয় ফাংশন ইমপোর্ট করা
const { 
    getAvailableCourses, 
    enrollInCourse, 
    getMyCourses, 
    submitQuizAttempt // এটি মিসিং ছিল, এখন যুক্ত করা হলো
} = require('../controllers/studentController');

// ২. সিকিউরিটি মিডলওয়্যার ইমপোর্ট করা
const { verifyToken } = require('../middleware/authMiddleware');

// ৩. মিডলওয়্যার অ্যাপ্লাই করা (সব স্টুডেন্ট রাউটের জন্য টোকেন বাধ্যতামূলক)
router.use(verifyToken);

// ==========================================
// Student API Endpoints
// ==========================================

// সব কোর্স লিস্ট দেখার জন্য
router.get('/courses', getAvailableCourses); 

// নতুন কোর্সে এনরোল করার জন্য
router.post('/enroll', enrollInCourse);       

// নিজের এনরোল করা কোর্সগুলো দেখার জন্য
router.get('/my-courses', getMyCourses);      

// কুইজ পরীক্ষা দেওয়ার এবং রেজাল্ট সাবমিট করার জন্য
router.post('/quiz/submit', submitQuizAttempt); 

module.exports = router;