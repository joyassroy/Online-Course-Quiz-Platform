// controllers/instructorLessonController.js

// 🌟 Get all lessons for a course
const getLessons = async (req, res) => {
    try {
        const [lessons] = await req.db.query(
            'SELECT * FROM Lessons WHERE course_id = ? ORDER BY sequence_order ASC',
            [req.params.courseId]
        );
        res.status(200).json({ success: true, data: lessons });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch lessons." });
    }
};

// 🌟 Add new lesson
const addLesson = async (req, res) => {
    const { courseId } = req.params;
    const { title, content, video_url, resource_file_url, is_free_preview } = req.body;

    try {
        // নতুন লেসনের জন্য সিরিয়াল নাম্বার বের করা (সবচেয়ে বড় সিরিয়াল + 1)
        const [[maxSeq]] = await req.db.query('SELECT MAX(sequence_order) as maxOrder FROM Lessons WHERE course_id = ?', [courseId]);
        const nextOrder = (maxSeq.maxOrder || 0) + 1;

        const [result] = await req.db.query(
            `INSERT INTO Lessons (course_id, title, content, video_url, resource_file_url, is_free_preview, sequence_order) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [courseId, title, content, video_url || null, resource_file_url || null, is_free_preview ? 1 : 0, nextOrder]
        );

        res.status(201).json({ success: true, message: "Lesson added successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to add lesson." });
    }
};

// 🌟 Update Lesson order (Up/Down)
const reorderLessons = async (req, res) => {
    const { courseId } = req.params;
    const { orderedLessons } = req.body; // Array of { id, sequence_order }

    try {
        await req.db.query('BEGIN'); // Transaction Start
        
        // সব লেসনের সিরিয়াল আপডেট করা
        for (let lesson of orderedLessons) {
            await req.db.query(
                'UPDATE Lessons SET sequence_order = ? WHERE id = ? AND course_id = ?',
                [lesson.sequence_order, lesson.id, courseId]
            );
        }

        await req.db.query('COMMIT');
        res.status(200).json({ success: true, message: "Lessons reordered successfully!" });
    } catch (error) {
        await req.db.query('ROLLBACK');
        res.status(500).json({ success: false, message: "Failed to reorder lessons." });
    }
};

// 🌟 Delete Lesson
const deleteLesson = async (req, res) => {
    try {
        await req.db.query('DELETE FROM Lessons WHERE id = ? AND course_id = ?', [req.params.lessonId, req.params.courseId]);
        res.status(200).json({ success: true, message: "Lesson deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete lesson." });
    }
};

module.exports = { getLessons, addLesson, reorderLessons, deleteLesson };