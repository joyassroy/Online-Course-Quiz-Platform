// routes/instructorRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardData ,createInstructorCourse,getInstructorCourses, submitCourseForReview, 
    deleteInstructorCourse, getCourseStudents, getInstructorCourseById, updateInstructorCourse} = require('../controllers/instructorController');
const { getQuizDetails, saveQuizSettings, saveQuestion, deleteQuestion, getQuizAttempts } = require('../controllers/instructorQuizController');
const { verifyToken, isInstructor, } = require('../middleware/authMiddleware');
const { getLessons, addLesson, reorderLessons, deleteLesson } = require('../controllers/instructorLessonController');
router.use(verifyToken, isInstructor);

// GET /api/instructor/dashboard
router.get('/dashboard', getDashboardData);
router.post('/courses', createInstructorCourse);
router.get('/courses', getInstructorCourses);
router.put('/courses/:id/submit', submitCourseForReview);
router.delete('/courses/:id', deleteInstructorCourse);
router.get('/courses/:id/students', getCourseStudents);
router.get('/courses/:id', getInstructorCourseById);
router.put('/courses/:id', updateInstructorCourse);
// 🌟 Lesson Management Routes (Nested Route)
router.get('/courses/:courseId/lessons', getLessons);
router.post('/courses/:courseId/lessons', addLesson);
router.put('/courses/:courseId/lessons/reorder', reorderLessons);
router.delete('/courses/:courseId/lessons/:lessonId', deleteLesson);
// 🌟 Quiz Management Routes
router.get('/courses/:courseId/quiz', getQuizDetails);
router.post('/courses/:courseId/quiz', saveQuizSettings);
router.post('/quizzes/:quizId/questions', saveQuestion);
router.delete('/questions/:questionId', deleteQuestion);
router.get('/quizzes/:quizId/attempts', getQuizAttempts);
module.exports = router;