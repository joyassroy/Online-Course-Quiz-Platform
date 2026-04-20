// @desc    Create a new Question
// @route   POST /api/admin/questions
exports.createQuestion = async (req, res) => {
    try {
        const { quiz_id, question_text, option_1, option_2, option_3, option_4, correct_option } = req.body;

        // ভ্যালিডেশন: কোনো ফিল্ড যেন মিসিং না থাকে
        if (!quiz_id || !question_text || !option_1 || !option_2 || !option_3 || !option_4 || !correct_option) {
            return res.status(400).json({ success: false, message: 'All fields (including 4 options and correct_option) are required.' });
        }

        // correct_option ১ থেকে ৪ এর মধ্যে হতে হবে
        if (correct_option < 1 || correct_option > 4) {
            return res.status(400).json({ success: false, message: 'correct_option must be between 1 and 4.' });
        }

        // তোমার ER Diagram অনুযায়ী ইনসার্ট কুয়েরি
        const [result] = await req.db.query(
            `INSERT INTO Questions 
            (quiz_id, question_text, option_1, option_2, option_3, option_4, correct_option) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [quiz_id, question_text, option_1, option_2, option_3, option_4, correct_option]
        );

        res.status(201).json({
            success: true,
            message: 'Question added successfully!',
            questionId: result.insertId
        });
    } catch (error) {
        // Foreign Key Error (যদি quiz_id ডাটাবেসে না থাকে)
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ success: false, message: 'Invalid quiz_id. Quiz does not exist.' });
        }
        console.error('Error creating question:', error);
        res.status(500).json({ success: false, message: 'Server error while adding question.' });
    }
};

// @desc    Get all questions for a specific Quiz (Optimized)
// @route   GET /api/admin/questions/quiz/:quizId
exports.getQuestionsByQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;

        const [questions] = await req.db.query(
            `SELECT id, question_text, option_1, option_2, option_3, option_4, correct_option 
             FROM Questions WHERE quiz_id = ? ORDER BY id ASC`,
            [quizId]
        );

        res.status(200).json({ success: true, count: questions.length, data: questions });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching questions.' });
    }
};

// @desc    Update a Question
// @route   PUT /api/admin/questions/:id
exports.updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { question_text, option_1, option_2, option_3, option_4, correct_option } = req.body;

        // COALESCE ব্যবহার করা হয়েছে যাতে শুধু পাঠানো ফিল্ডগুলোই আপডেট হয়
        const [result] = await req.db.query(
            `UPDATE Questions 
             SET question_text = COALESCE(?, question_text),
                 option_1 = COALESCE(?, option_1),
                 option_2 = COALESCE(?, option_2),
                 option_3 = COALESCE(?, option_3),
                 option_4 = COALESCE(?, option_4),
                 correct_option = COALESCE(?, correct_option)
             WHERE id = ?`,
            [question_text, option_1, option_2, option_3, option_4, correct_option, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Question not found.' });
        }

        res.status(200).json({ success: true, message: 'Question updated successfully!' });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ success: false, message: 'Server error while updating question.' });
    }
};

// @desc    Delete a Question (Hard Delete as per ERD)
// @route   DELETE /api/admin/questions/:id
exports.deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await req.db.query('DELETE FROM Questions WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Question not found.' });
        }

        res.status(200).json({ success: true, message: 'Question deleted successfully!' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting question.' });
    }
};