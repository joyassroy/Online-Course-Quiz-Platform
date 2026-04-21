// @desc    Create a new Course
// @route   POST /api/admin/courses
const createCourse = async (req, res) => {
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
const getAllCourses = async (req, res) => {
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

// @desc    Update Course Status (Approve/Reject/Unpublish)
// @route   PUT /api/admin/courses/:id/status
const updateCourseStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'Published', 'Draft', 'Pending Review'

    try {
        const [result] = await req.db.query('UPDATE Courses SET status = ? WHERE id = ?', [status, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        res.status(200).json({ success: true, message: `Course status updated to ${status}` });
    } catch (error) {
        console.error("Update Course Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to update course status" });
    }
};

// @desc    Delete a Course
// @route   DELETE /api/admin/courses/:id
const deleteCourse = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await req.db.query('DELETE FROM Courses WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        res.status(200).json({ success: true, message: "Course deleted successfully" });
    } catch (error) {
        console.error("Delete Course Error:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Cannot delete course. It may have connected lessons or enrollments." 
        });
    }
};

// এক্সপোর্ট করা হচ্ছে
module.exports = { 
    createCourse, 
    getAllCourses, 
    updateCourseStatus, 
    deleteCourse 
};