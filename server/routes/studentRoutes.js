const express = require('express');
const router = express.Router();

const { 
    getAvailableCourses, 
    enrollInCourse, 
    getMyCourses, 
    getUserProfile, 
    completeLesson, 
    submitQuizAttempt, 
    getLeaderboard, 
    getCourseLessons,
    getQuizForStudent,
    getMyCertificates,
    generateCertificate,
    getCourseById // 🌟 এইটা মিসিং ছিল!
} = require('../controllers/studentController');

const { verifyToken, isStudent } = require('../middleware/authMiddleware');

// 🔒 এই ফাইলের সব রাউট শুধুমাত্র স্টুডেন্টদের জন্য প্রোটেক্টেড
router.use(verifyToken, isStudent);

// 📌 Dashboard & Profile
router.get('/profile', getUserProfile);
router.get('/my-courses', getMyCourses);

// 📌 Course Explorer & Enrollment
router.get('/courses', getAvailableCourses);
router.post('/enroll', enrollInCourse);

// 📌 Learning & Progress
router.post('/lesson/complete', completeLesson);
router.get('/courses/:courseId/lessons', getCourseLessons);

// 📌 Quiz & Assessment
router.get('/quiz/:courseId', getQuizForStudent);
router.post('/quiz/submit', submitQuizAttempt);
router.get('/leaderboard/:quizId', getLeaderboard);

// 📌 Certificate Routes
router.post('/certificate/generate', generateCertificate); // 🌟 এই রাউটটা মিসিং ছিল!
router.get('/certificates', getMyCertificates);

router.get('/courses/:id', getCourseById);

module.exports = router;