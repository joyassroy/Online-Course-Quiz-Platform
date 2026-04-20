// @desc    Create a new Course
// @route   POST /api/admin/courses
exports.createCourse = async (req, res) => {
    try {
        const { title, description, category, difficulty, price, thumbnail_url } = req.body;
        const instructor_id = req.user.id; // JWT টোকেন থেকে অ্যাডমিন আইডি নিচ্ছি

        if (!title || !category) {
            return res.status(400).json({ success: false, message: 'Title and Category are required.' });
        }

        const [result] = await req.db.query(
            `INSERT INTO Courses (instructor_id, title, description, category, thumbnail_url, difficulty, price, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Published')`,
            [instructor_id, title, description || null, category, thumbnail_url || null, difficulty || 'Beginner', price || 0]
        );

        res.status(201).json({ success: true, message: 'Course created successfully!', courseId: result.insertId });
    } catch (error) {
        console.error('Course Creation Error:', error);
        res.status(500).json({ success: false, message: 'Server error while creating course.' });
    }
};

// @desc    Get all Courses (Optimized for Admin)
// @route   GET /api/admin/courses
exports.getAllCourses = async (req, res) => {
    try {
        const [courses] = await req.db.query(
            `SELECT c.*, u.full_name as instructor_name 
             FROM Courses c 
             LEFT JOIN Users u ON c.instructor_id = u.id 
             ORDER BY c.created_at DESC`
        );
        res.status(200).json({ success: true, count: courses.length, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};