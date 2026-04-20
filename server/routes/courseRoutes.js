const express = require('express');
const router = express.Router();
const { createCourse, getAllCourses } = require('../controllers/courseController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken, isAdmin);
router.post('/', createCourse);
router.get('/', getAllCourses);

module.exports = router;