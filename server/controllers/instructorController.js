// controllers/instructorController.js

exports.getDashboardData = async (req, res) => {
    const instructor_id = req.user.id; // টোকেন থেকে ইনস্ট্রাক্টরের আইডি

    try {
        // ১. Total Courses
        const [[courseCount]] = await req.db.query(
            'SELECT COUNT(*) as total FROM Courses WHERE instructor_id = ?', 
            [instructor_id]
        );

        // ২. Total Enrolled Students (Unique)
        const [[studentCount]] = await req.db.query(
            `SELECT COUNT(DISTINCT e.student_id) as total 
             FROM Enrollments e 
             JOIN Courses c ON e.course_id = c.id 
             WHERE c.instructor_id = ?`, 
            [instructor_id]
        );

        // ৩. Average Quiz Scores
        const [[quizScore]] = await req.db.query(
            `SELECT AVG(qa.score) as average 
             FROM Quiz_Attempts qa 
             JOIN Quizzes q ON qa.quiz_id = q.id 
             JOIN Courses c ON q.course_id = c.id 
             WHERE c.instructor_id = ?`, 
            [instructor_id]
        );

        // ৪. List of Courses
        const [courses] = await req.db.query(
            `SELECT id, title, category, status, price, created_at 
             FROM Courses 
             WHERE instructor_id = ? 
             ORDER BY created_at DESC`, 
            [instructor_id]
        );

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalCourses: courseCount.total || 0,
                    totalStudents: studentCount.total || 0,
                    avgQuizScore: quizScore.average ? Number(quizScore.average).toFixed(1) : 0
                },
                courses: courses
            }
        });

    } catch (error) {
        console.error("Instructor Dashboard Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch dashboard data." });
    }
};
// controllers/instructorController.js এর ভেতরে যোগ করো:

exports.createInstructorCourse = async (req, res) => {
    try {
        const { title, description, category, difficulty, price, thumbnail_url } = req.body;
        const instructor_id = req.user.id; // ടোকেন থেকে ইনস্ট্রাক্টর আইডি

        if (!title || !category) {
            return res.status(400).json({ success: false, message: 'Title and Category are required.' });
        }

        // 🌟 ম্যাজিক: ইনস্ট্রাক্টর বানালে স্ট্যাটাস ডিফল্টভাবে 'Pending Review' হবে
        const [result] = await req.db.query(
            `INSERT INTO Courses (instructor_id, title, description, category, thumbnail_url, difficulty, price, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending Review')`,
            [instructor_id, title, description || null, category, thumbnail_url || null, difficulty || 'Beginner', price || 0]
        );

        res.status(201).json({ success: true, message: 'Course created and sent for review!', courseId: result.insertId });
    } catch (error) {
        console.error('Course Creation Error:', error.message);
        res.status(500).json({ success: false, message: 'Server error while creating course.' });
    }
};
// ==========================================
// Get All Courses for Instructor
// ==========================================
exports.getInstructorCourses = async (req, res) => {
    try {
        const [courses] = await req.db.query(
            'SELECT * FROM Courses WHERE instructor_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.status(200).json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch courses." });
    }
};

// ==========================================
//  Submit Course for Review
// ==========================================
exports.submitCourseForReview = async (req, res) => {
    const { id } = req.params;
    try {
        // শুধুমাত্র Draft অবস্থায় থাকলেই সেটা Pending Review তে পাঠানো যাবে
        const [result] = await req.db.query(
            "UPDATE Courses SET status = 'Pending Review' WHERE id = ? AND instructor_id = ? AND status = 'Draft'",
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Course not found or already submitted." });
        }
        res.status(200).json({ success: true, message: "Course submitted for Admin review!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to submit course." });
    }
};

// ==========================================
//  Delete Own Course
// ==========================================
exports.deleteInstructorCourse = async (req, res) => {
    const { id } = req.params;
    try {
        // সিকিউরিটি: শুধু নিজের কোর্স ডিলিট করতে পারবে
        const [result] = await req.db.query(
            'DELETE FROM Courses WHERE id = ? AND instructor_id = ?',
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Course not found or unauthorized." });
        }
        res.status(200).json({ success: true, message: "Course deleted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Cannot delete course. It may have active students." });
    }
};

// ==========================================
//  View Enrolled Students
// ==========================================
exports.getCourseStudents = async (req, res) => {
    const { id } = req.params; // course_id
    try {
        // প্রথমে চেক করি কোর্সটা এই ইনস্ট্রাক্টরের কি না
        const [[course]] = await req.db.query('SELECT id FROM Courses WHERE id = ? AND instructor_id = ?', [id, req.user.id]);
        if (!course) return res.status(403).json({ success: false, message: "Unauthorized access to this course." });

        // স্টুডেন্টদের লিস্ট আনা
        const [students] = await req.db.query(
            `SELECT u.id, u.full_name, u.email, e.enrolled_at, e.progress_percentage 
             FROM Enrollments e 
             JOIN Users u ON e.student_id = u.id 
             WHERE e.course_id = ?`,
            [id]
        );
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch enrolled students." });
    }
};

// ==========================================
// 🌟 Get Single Course (For Edit Page)
// ==========================================
exports.getInstructorCourseById = async (req, res) => {
    try {
        const [[course]] = await req.db.query(
            'SELECT * FROM Courses WHERE id = ? AND instructor_id = ?',
            [req.params.id, req.user.id]
        );
        if (!course) return res.status(404).json({ success: false, message: "Course not found." });
        res.status(200).json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ==========================================
// 🌟 Update Course Details
// ==========================================
exports.updateInstructorCourse = async (req, res) => {
    const { title, description, category, difficulty, price, thumbnail_url } = req.body;
    try {
        const [result] = await req.db.query(
            `UPDATE Courses 
             SET title=?, description=?, category=?, difficulty=?, price=?, thumbnail_url=? 
             WHERE id=? AND instructor_id=?`,
            [title, description, category, difficulty, price, thumbnail_url, req.params.id, req.user.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Course not found." });
        res.status(200).json({ success: true, message: "Course updated successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update course." });
    }
};

// module.exports এ এই দুটো অ্যাড করতে ভুলো না!
// getInstructorCourseById, updateInstructorCourse



