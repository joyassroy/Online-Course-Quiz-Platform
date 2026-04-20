const express = require('express');
const router = express.Router();
const { createQuiz, getQuizzesByCourse } = require('../controllers/quizController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken, isAdmin);
router.post('/', createQuiz);
router.get('/course/:courseId', getQuizzesByCourse);

module.exports = router;