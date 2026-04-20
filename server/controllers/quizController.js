// @desc    Create a new Quiz under a Course
// @route   POST /api/admin/quizzes
exports.createQuiz = async (req, res) => {
    try {
        const { course_id, title, time_limit_minutes, pass_percentage, max_attempts } = req.body;

        if (!course_id || !title) {
            return res.status(400).json({ success: false, message: 'Course ID and Title are required.' });
        }

        const [result] = await req.db.query(
            `INSERT INTO Quizzes (course_id, title, time_limit_minutes, pass_percentage, max_attempts) 
             VALUES (?, ?, ?, ?, ?)`,
            [course_id, title, time_limit_minutes || 30, pass_percentage || 50, max_attempts || 1]
        );

        res.status(201).json({ success: true, message: 'Quiz created successfully!', quizId: result.insertId });
    } catch (error) {
        console.error('Quiz Creation Error:', error);
        res.status(500).json({ success: false, message: 'Server error while creating quiz.' });
    }
};

// @desc    Get Quizzes by Course ID
// @route   GET /api/admin/quizzes/course/:courseId
exports.getQuizzesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const [quizzes] = await req.db.query('SELECT * FROM Quizzes WHERE course_id = ?', [courseId]);
        res.status(200).json({ success: true, data: quizzes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};