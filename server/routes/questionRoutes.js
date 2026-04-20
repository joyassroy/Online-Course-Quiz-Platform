const express = require('express');
const router = express.Router();
const { createQuestion, getQuestionsByQuiz, updateQuestion, deleteQuestion } = require('../controllers/questionController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// সব রাউট সুরক্ষিত (শুধুমাত্র অ্যাডমিন প্রশ্ন যোগ বা ডিলিট করতে পারবে)
router.use(verifyToken, isAdmin);

// Routes
router.post('/', createQuestion);                     // নতুন প্রশ্ন যোগ
router.get('/quiz/:quizId', getQuestionsByQuiz);      // নির্দিষ্ট কুইজের সব প্রশ্ন দেখা
router.put('/:id', updateQuestion);                   // প্রশ্ন আপডেট করা
router.delete('/:id', deleteQuestion);                // প্রশ্ন ডিলিট করা

module.exports = router;