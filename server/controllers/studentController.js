// @desc    Get all available courses for students
// @route   GET /api/student/courses
exports.getAvailableCourses = async (req, res) => {
    try {
        // শুধুমাত্র 'Published' কোর্সগুলো ছাত্ররা দেখতে পাবে
        const [courses] = await req.db.query(
            `SELECT c.id, c.title, c.description, c.category, c.thumbnail_url, c.difficulty, c.price, u.full_name as instructor_name 
             FROM Courses c 
             LEFT JOIN Users u ON c.instructor_id = u.id 
             WHERE c.status = 'Published' 
             ORDER BY c.created_at DESC`
        );
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Enroll in a course
// @route   POST /api/student/enroll
exports.enrollInCourse = async (req, res) => {
    try {
        const { course_id } = req.body;
        const student_id = req.user.id; // JWT টোকেন থেকে স্টুডেন্ট আইডি

        if (!course_id) {
            return res.status(400).json({ success: false, message: 'Course ID is required.' });
        }

        // ১. চেক করা ছাত্রটি অলরেডি এনরোলড কি না
        const [existing] = await req.db.query(
            'SELECT id FROM Enrollments WHERE student_id = ? AND course_id = ?',
            [student_id, course_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
        }

        // ২. এনরোলমেন্ট টেবিলে ডেটা ইনসার্ট করা
        await req.db.query(
            'INSERT INTO Enrollments (student_id, course_id, progress_percentage) VALUES (?, ?, ?)',
            [student_id, course_id, 0]
        );

        res.status(201).json({ success: true, message: 'Enrolled successfully!' });
    } catch (error) {
        console.error('Enrollment Error:', error);
        res.status(500).json({ success: false, message: 'Server error during enrollment.' });
    }
};

// @desc    Get my enrolled courses
// @route   GET /api/student/my-courses
exports.getMyCourses = async (req, res) => {
    try {
        const student_id = req.user.id;
        const [courses] = await req.db.query(
            `SELECT c.id, c.title, c.category, e.enrolled_at, e.progress_percentage 
             FROM Enrollments e 
             JOIN Courses c ON e.course_id = c.id 
             WHERE e.student_id = ?`,
            [student_id]
        );
        res.status(200).json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Submit Quiz Attempt and Calculate Score
// @route   POST /api/student/quiz/submit
exports.submitQuizAttempt = async (req, res) => {
    try {
        const { quiz_id, answers } = req.body; // answers: [{ question_id: 1, selected_option: 2 }, ...]
        const student_id = req.user.id;

        if (!quiz_id || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: 'Invalid submission data.' });
        }

        // ১. ওই কুইজের সব সঠিক উত্তর ডাটাবেস থেকে নিয়ে আসা
        const [questions] = await req.db.query(
            'SELECT id, correct_option FROM Questions WHERE quiz_id = ?',
            [quiz_id]
        );

        if (questions.length === 0) {
            return res.status(404).json({ success: false, message: 'No questions found for this quiz.' });
        }

        // ২. কুইজের পাসিং ক্রাইটেরিয়া চেক করা
        const [quizInfo] = await req.db.query(
            'SELECT pass_percentage, max_attempts FROM Quizzes WHERE id = ?',
            [quiz_id]
        );
        const { pass_percentage, max_attempts } = quizInfo[0];

        // ৩. স্কোর ক্যালকুলেট করা
        let correctAnswersCount = 0;
        questions.forEach(q => {
            const userAns = answers.find(a => a.question_id === q.id);
            if (userAns && userAns.selected_option === q.correct_option) {
                correctAnswersCount++;
            }
        });

        const scorePercentage = (correctAnswersCount / questions.length) * 100;
        const isPassed = scorePercentage >= pass_percentage;

        // ৪. Quiz_Attempts টেবিলে রেজাল্ট সেভ করা (তোমার ERD অনুযায়ী)
        const [result] = await req.db.query(
            `INSERT INTO Quiz_Attempts (student_id, quiz_id, score, is_passed) 
             VALUES (?, ?, ?, ?)`,
            [student_id, quiz_id, scorePercentage, isPassed]
        );

        res.status(200).json({
            success: true,
            message: isPassed ? 'Congratulations! You passed.' : 'Better luck next time.',
            results: {
                total_questions: questions.length,
                correct_answers: correctAnswersCount,
                score_percentage: scorePercentage.toFixed(2),
                is_passed: isPassed
            },
            attempt_id: result.insertId
        });

    } catch (error) {
        console.error('Quiz Submission Error:', error);
        res.status(500).json({ success: false, message: 'Server error during submission.' });
    }
};