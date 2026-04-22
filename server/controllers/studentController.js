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


// @desc    Submit Quiz Attempt, Calculate Score & Auto-Generate Certificate
// @route   POST /api/student/quiz/submit
exports.submitQuizAttempt = async (req, res) => {
    try {
        const { quiz_id, answers } = req.body;
        const student_id = req.user.id;

        if (!quiz_id || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: 'Invalid submission data.' });
        }

        // ১. ওই কুইজের কোর্স আইডি এবং পাসিং ক্রাইটেরিয়া নিয়ে আসা
        const [quizInfo] = await req.db.query(
            'SELECT id, course_id, pass_percentage FROM Quizzes WHERE id = ?',
            [quiz_id]
        );
        
        if (quizInfo.length === 0) return res.status(404).json({ success: false, message: 'Quiz not found.' });
        const { course_id, pass_percentage } = quizInfo[0];

        // ২. প্রশ্ন ও সঠিক উত্তর আনা
        const [questions] = await req.db.query('SELECT id, correct_option FROM Questions WHERE quiz_id = ?', [quiz_id]);

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

        // ৪. Quiz_Attempts টেবিলে রেজাল্ট সেভ করা
        const [result] = await req.db.query(
            `INSERT INTO Quiz_Attempts (student_id, quiz_id, score, is_passed) VALUES (?, ?, ?, ?)`,
            [student_id, quiz_id, scorePercentage, isPassed]
        );

        // 🌟 ৫. অটোমেটিক সার্টিফিকেট জেনারেশন (যদি পাস করে)
        let certificateCode = null;
        if (isPassed) {
            // আগে চেক করি অলরেডি এই কোর্সের সার্টিফিকেট আছে কি না (যাতে ডাবল জেনারেট না হয়)
            const [existingCert] = await req.db.query(
                'SELECT certificate_code FROM Certificates WHERE student_id = ? AND course_id = ?',
                [student_id, course_id]
            );

            if (existingCert.length === 0) {
                // নতুন সার্টিফিকেট কোড বানানো এবং সেভ করা
                certificateCode = `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
                await req.db.query(
                    'INSERT INTO Certificates (student_id, course_id, certificate_code, issued_at) VALUES (?, ?, ?, NOW())',
                    [student_id, course_id, certificateCode]
                );
                console.log(`Certificate Auto-Generated: ${certificateCode} for Student: ${student_id}`);
            } else {
                certificateCode = existingCert[0].certificate_code;
            }
        }

        res.status(200).json({
            success: true,
            message: isPassed ? 'Congratulations! You passed and earned a certificate.' : 'Better luck next time.',
            results: {
                total_questions: questions.length,
                correct_answers: correctAnswersCount,
                score_percentage: scorePercentage.toFixed(2),
                is_passed: isPassed,
                certificate_code: certificateCode // ফ্রন্টএন্ডকে জানিয়ে দেওয়া হলো
            }
        });

    } catch (error) {
        console.error('Quiz Submission Error:', error);
        res.status(500).json({ success: false, message: 'Server error during submission.' });
    }
};
// @desc    Get Leaderboard for a specific Quiz (Top Scorers)
// @route   GET /api/student/leaderboard/:quizId
exports.getLeaderboard = async (req, res) => {
    try {
        const { quizId } = req.params;

        // একজন ছাত্র একাধিকবার পরীক্ষা দিতে পারে, তাই আমরা শুধু তার সেরা স্কোর (MAX score) নেবো
        const [leaderboard] = await req.db.query(
            `SELECT u.full_name, MAX(qa.score) as best_score, MAX(qa.attempt_date) as last_attempt
             FROM Quiz_Attempts qa
             JOIN Users u ON qa.student_id = u.id
             WHERE qa.quiz_id = ?
             GROUP BY qa.student_id
             ORDER BY best_score DESC, last_attempt ASC
             LIMIT 10`, 
            [quizId]
        );

        res.status(200).json({ success: true, data: leaderboard });
    } catch (error) {
        console.error('Leaderboard Error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching leaderboard.' });
    }
};

// @desc    Get User Profile with Stats (Enrolled courses & Quiz history)
// @route   GET /api/student/profile
exports.getUserProfile = async (req, res) => {
    try {
        const student_id = req.user.id;

        // ১. ইউজারের বেসিক তথ্য
        const [user] = await req.db.query(
            'SELECT id, full_name, email, status, created_at FROM Users WHERE id = ?',
            [student_id]
        );

        // ২. ইউজারের এনরোলমেন্ট এবং কুইজ স্ট্যাটাস (অ্যাডভান্সড আর্কিটেক্ট কুয়েরি)
        const [stats] = await req.db.query(
            `SELECT 
                (SELECT COUNT(*) FROM Enrollments WHERE student_id = ?) as total_enrolled,
                (SELECT COUNT(*) FROM Quiz_Attempts WHERE student_id = ? AND is_passed = 1) as quizzes_passed,
                (SELECT AVG(score) FROM Quiz_Attempts WHERE student_id = ?) as average_score`,
            [student_id, student_id, student_id]
        );

        // ৩. সাম্প্রতিক কুইজ অ্যাটেম্পটগুলো
        const [recentAttempts] = await req.db.query(
            `SELECT q.title as quiz_name, qa.score, qa.is_passed, qa.attempt_date 
             FROM Quiz_Attempts qa
             JOIN Quizzes q ON qa.quiz_id = q.id
             WHERE qa.student_id = ?
             ORDER BY qa.attempt_date DESC LIMIT 5`,
            [student_id]
        );

        res.status(200).json({
            success: true,
            data: {
                profile: user[0],
                statistics: stats[0],
                recent_activity: recentAttempts
            }
        });
    } catch (error) {
        console.error('Profile Error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching profile.' });
    }
};
// @desc    Mark a lesson as completed and update overall course progress
// @route   POST /api/student/lesson/complete
exports.completeLesson = async (req, res) => {
    try {
        const { lesson_id, course_id } = req.body;
        const student_id = req.user.id;

        if (!lesson_id || !course_id) {
            return res.status(400).json({ success: false, message: 'Lesson ID and Course ID are required.' });
        }

        // ১. লেসনটি অলরেডি কমপ্লিট কি না চেক করা
        const [existing] = await req.db.query(
            'SELECT id FROM User_Lesson_Progress WHERE student_id = ? AND lesson_id = ?',
            [student_id, lesson_id]
        );

        if (existing.length === 0) {
            // ২. কমপ্লিশন রেকর্ড ইনসার্ট করা
            await req.db.query(
                'INSERT INTO User_Lesson_Progress (student_id, lesson_id, is_completed, completed_at) VALUES (?, ?, 1, NOW())',
                [student_id, lesson_id]
            );
        }

        // ৩. ক্যালকুলেশন: ওই কোর্সে মোট কয়টি লেসন আছে?
        const [totalLessons] = await req.db.query(
            'SELECT COUNT(*) as count FROM Lessons WHERE course_id = ?',
            [course_id]
        );

        // ৪. ক্যালকুলেশন: ওই স্টুডেন্ট ওই কোর্সের কয়টি লেসন শেষ করেছে?
        const [completedLessons] = await req.db.query(
            `SELECT COUNT(ulp.id) as count 
             FROM User_Lesson_Progress ulp
             JOIN Lessons l ON ulp.lesson_id = l.id
             WHERE ulp.student_id = ? AND l.course_id = ?`,
            [student_id, course_id]
        );

        // ৫. প্রগ্রেস পার্সেন্টেজ আপডেট করা (Enrollments টেবিলে)
        const progress = (completedLessons[0].count / totalLessons[0].count) * 100;

        await req.db.query(
            'UPDATE Enrollments SET progress_percentage = ? WHERE student_id = ? AND course_id = ?',
            [progress, student_id, course_id]
        );

        res.status(200).json({
            success: true,
            message: 'Lesson marked as completed.',
            current_progress: progress.toFixed(2) + '%'
        });

    } catch (error) {
        console.error('Progress Error:', error);
        res.status(500).json({ success: false, message: 'Server error while updating progress.' });
    }
};
const crypto = require('crypto'); // ইউনিক কোড জেনারেশনের জন্য

// @desc    Generate Certificate for a completed course
// @route   POST /api/student/certificate/generate
exports.generateCertificate = async (req, res) => {
    try {
        const { course_id } = req.body;
        const student_id = req.user.id;

        // ১. চেক করা ছাত্রটি কোর্সটি ১০০% শেষ করেছে কি না
        const [enrollment] = await req.db.query(
            'SELECT progress_percentage FROM Enrollments WHERE student_id = ? AND course_id = ?',
            [student_id, course_id]
        );

        if (enrollment.length === 0 || enrollment[0].progress_percentage < 100) {
            return res.status(400).json({ 
                success: false, 
                message: 'You must complete 100% of the course to earn a certificate.' 
            });
        }

        // ২. চেক করা সার্টিফিকেট অলরেডি ইস্যু করা হয়েছে কি না
        const [existing] = await req.db.query(
            'SELECT certificate_code FROM Certificates WHERE student_id = ? AND course_id = ?',
            [student_id, course_id]
        );

        if (existing.length > 0) {
            return res.status(200).json({ 
                success: true, 
                message: 'Certificate already issued.', 
                certificate_code: existing[0].certificate_code 
            });
        }

        // ৩. ইউনিক সার্টিফিকেট কোড জেনারেশন (e.g., CERT-XXXXX)
        const certificate_code = `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // ৪. Certificates টেবিলে সেভ করা (তোমার ERD অনুযায়ী)
        await req.db.query(
            'INSERT INTO Certificates (student_id, course_id, certificate_code, issued_at) VALUES (?, ?, ?, NOW())',
            [student_id, course_id, certificate_code]
        );

        res.status(201).json({
            success: true,
            message: 'Congratulations! Your certificate has been generated.',
            certificate_code: certificate_code
        });

    } catch (error) {
        console.error('Certificate Error:', error);
        res.status(500).json({ success: false, message: 'Server error while generating certificate.' });
    }
};
// @desc    Get all lessons for an enrolled course (Student View)
// @route   GET /api/student/courses/:courseId/lessons
exports.getCourseLessons = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.id;

        // ১. চেক করবো স্টুডেন্ট এই কোর্সে এনরোলড কি না
        const [enrollment] = await req.db.query(
            'SELECT progress_percentage FROM Enrollments WHERE student_id = ? AND course_id = ?',
            [studentId, courseId]
        );

        if (enrollment.length === 0) {
            return res.status(403).json({ success: false, message: 'You are not enrolled in this course.' });
        }

        // ২. কোর্সের সব লেসন আনবো এবং দেখবো স্টুডেন্ট কোনটা কোনটা কমপ্লিট করেছে
        const [lessons] = await req.db.query(
            `SELECT l.id, l.title, l.content, l.video_url, l.resource_file_url, l.sequence_order,
                    IF(ulp.id IS NOT NULL, true, false) as is_completed
             FROM Lessons l
             LEFT JOIN User_Lesson_Progress ulp ON l.id = ulp.lesson_id AND ulp.student_id = ?
             WHERE l.course_id = ?
             ORDER BY l.sequence_order ASC`,
            [studentId, courseId]
        );

        res.status(200).json({ 
            success: true, 
            data: {
                progress: enrollment[0].progress_percentage,
                lessons: lessons
            } 
        });

    } catch (error) {
        console.error('Fetch Lessons Error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching lessons.' });
    }
};
// @desc    Get Quiz & Questions for a Course (Student View - HIDDEN ANSWERS)
// @route   GET /api/student/quiz/:courseId
exports.getQuizForStudent = async (req, res) => {
    try {
        const { courseId } = req.params;

        // ১. কোর্সের কুইজ খোঁজা
        const [quizResult] = await req.db.query(
            'SELECT id, title, time_limit_minutes, pass_percentage, max_attempts FROM Quizzes WHERE course_id = ?',
            [courseId]
        );

        if (quizResult.length === 0) {
            return res.status(404).json({ success: false, message: 'No quiz found for this course.' });
        }

        const quiz = quizResult[0];

        // ২. প্রশ্নগুলো আনা (সতর্কতা: correct_option সিলেক্ট করা হয়নি!)
        const [questions] = await req.db.query(
            'SELECT id, question_text, option_1, option_2, option_3, option_4 FROM Questions WHERE quiz_id = ?',
            [quiz.id]
        );

        res.status(200).json({
            success: true,
            data: {
                quiz: quiz,
                questions: questions
            }
        });

    } catch (error) {
        console.error('Fetch Quiz Error:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching quiz.' });
    }
};
// @desc    Get all certificates with detailed info
// @route   GET /api/student/certificates
exports.getMyCertificates = async (req, res) => {
    try {
        const student_id = req.user.id;
        
        const query = `
            SELECT 
                cert.certificate_code, 
                cert.issued_at as completion_date, 
                c.title as course_title, 
                c.category,
                u_student.full_name as student_name, 
                u_instructor.full_name as instructor_name,
                (SELECT MAX(score) FROM Quiz_Attempts qa 
                 JOIN Quizzes q ON qa.quiz_id = q.id 
                 WHERE qa.student_id = cert.student_id AND q.course_id = c.id AND qa.is_passed = 1) as score
            FROM Certificates cert
            JOIN Courses c ON cert.course_id = c.id
            JOIN Users u_student ON cert.student_id = u_student.id
            JOIN Users u_instructor ON c.instructor_id = u_instructor.id
            WHERE cert.student_id = ?
            ORDER BY cert.issued_at DESC
        `;
        
        const [certs] = await req.db.query(query, [student_id]);
        res.status(200).json({ success: true, data: certs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// একটি নির্দিষ্ট কোর্স আইডি দিয়ে ডাটা আনা
exports.getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user.id; // টোকেন থেকে পাওয়া

        // কোর্স তথ্য আনা
        const [course] = await req.db.query('SELECT * FROM courses WHERE id = ?', [id]);
        
        // স্টুডেন্ট এনরোলড কি না চেক করা
        const [enrollment] = await req.db.query(
            'SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?', 
            [studentId, id]
        );

        if (course.length === 0) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        res.json({ 
            success: true, 
            data: course[0], 
            isEnrolled: enrollment.length > 0 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};