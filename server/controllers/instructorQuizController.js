// controllers/instructorQuizController.js

// 🌟 ১. Get Quiz & Questions
const getQuizDetails = async (req, res) => {
    try {
        // প্রথমে কুইজ খুঁজবো
        const [[quiz]] = await req.db.query('SELECT * FROM Quizzes WHERE course_id = ?', [req.params.courseId]);
        
        if (!quiz) {
            return res.status(200).json({ success: true, data: null, message: "No quiz found for this course." });
        }

        // কুইজ থাকলে তার প্রশ্নগুলো আনবো
        const [questions] = await req.db.query('SELECT * FROM Questions WHERE quiz_id = ?', [quiz.id]);
        
        res.status(200).json({ success: true, data: { ...quiz, questions } });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// 🌟 ২. Save or Update Quiz Settings
const saveQuizSettings = async (req, res) => {
    const { courseId } = req.params;
    const { title, time_limit_minutes, pass_percentage, max_attempts } = req.body;

    try {
        const [[existingQuiz]] = await req.db.query('SELECT id FROM Quizzes WHERE course_id = ?', [courseId]);

        if (existingQuiz) {
            // Update
            await req.db.query(
                'UPDATE Quizzes SET title=?, time_limit_minutes=?, pass_percentage=?, max_attempts=? WHERE id=?',
                [title, time_limit_minutes, pass_percentage, max_attempts, existingQuiz.id]
            );
            return res.status(200).json({ success: true, message: "Quiz updated!", quizId: existingQuiz.id });
        } else {
            // Create
            const [result] = await req.db.query(
                'INSERT INTO Quizzes (course_id, title, time_limit_minutes, pass_percentage, max_attempts) VALUES (?, ?, ?, ?, ?)',
                [courseId, title, time_limit_minutes, pass_percentage, max_attempts || 3]
            );
            return res.status(201).json({ success: true, message: "Quiz created!", quizId: result.insertId });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to save quiz." });
    }
};

// 🌟 ৩. Add/Edit Question
const saveQuestion = async (req, res) => {
    const { question_text, option_1, option_2, option_3, option_4, correct_option } = req.body;
    try {
        await req.db.query(
            `INSERT INTO Questions (quiz_id, question_text, option_1, option_2, option_3, option_4, correct_option) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.params.quizId, question_text, option_1, option_2, option_3, option_4, correct_option]
        );
        res.status(201).json({ success: true, message: "Question added!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to save question." });
    }
};

// 🌟 ৪. Delete Question
const deleteQuestion = async (req, res) => {
    try {
        await req.db.query('DELETE FROM Questions WHERE id = ?', [req.params.questionId]);
        res.status(200).json({ success: true, message: "Question deleted!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete question." });
    }
};

// 🌟 ৫. View Student Attempts
const getQuizAttempts = async (req, res) => {
    try {
        const [attempts] = await req.db.query(
            `SELECT qa.*, u.full_name, u.email 
             FROM Quiz_Attempts qa 
             JOIN Users u ON qa.student_id = u.id 
             WHERE qa.quiz_id = ? 
             ORDER BY qa.attempt_date DESC`,
            [req.params.quizId]
        );
        res.status(200).json({ success: true, data: attempts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch attempts." });
    }
};

module.exports = { getQuizDetails, saveQuizSettings, saveQuestion, deleteQuestion, getQuizAttempts };