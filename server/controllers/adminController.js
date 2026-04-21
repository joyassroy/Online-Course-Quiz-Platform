//const db = require('../config/db');
// @desc    Get all users (with optional status filter)
// @route   GET /api/admin/users?status=Pending
exports.getAllUsers = async (req, res) => {
    try {
        const { status } = req.query; // URL থেকে স্ট্যাটাস ফিল্টার করার জন্য
        
        let query = `SELECT u.id, u.full_name, u.email, u.status, u.created_at, r.role_name 
                     FROM Users u 
                     LEFT JOIN Roles r ON u.role_id = r.id`;
        let queryParams = [];

        // যদি অ্যাডমিন শুধু Pending ইউজারদের দেখতে চায়
        if (status) {
            query += ` WHERE u.status = ?`;
            queryParams.push(status);
        }
        
        query += ` ORDER BY u.created_at DESC`; // নতুন ইউজাররা আগে থাকবে

        const [users] = await req.db.query(query, queryParams);
        res.status(200).json({ success: true, count: users.length, data: users });
        
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching users.' });
    }
};

// @desc    Update user status (Approve/Reject)
// @route   PUT /api/admin/users/:id/status
exports.updateUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const { status, admin_remark } = req.body;

        // শুধু এই ৩টি স্ট্যাটাসই দেওয়া যাবে
        if (!['Active', 'Rejected', 'Suspended'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }

        const [result] = await req.db.query(
            `UPDATE Users SET status = ?, admin_remark = ? WHERE id = ?`,
            [status, admin_remark || null, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({ 
            success: true, 
            message: `User successfully marked as ${status}` 
        });

    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ success: false, message: 'Server error while updating status.' });
    }
};
exports.updateUserDetails = async (req, res) => {
    const { id } = req.params;
    const { full_name, email, role_id } = req.body;

    try {
        const updateQuery = `
            UPDATE Users 
            SET full_name = ?, email = ?, role_id = ? 
            WHERE id = ?
        `;
        
        const [result] = await req.db.query(updateQuery, [full_name, email, role_id, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({ success: true, message: "User details updated successfully!" });

    } catch (error) {
        // 🔴 এইখানে আমরা আসল এররটা রেসপন্সে পাঠিয়ে দিচ্ছি!
        console.error("Database Update Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to update user.",
            real_error: error.message, // 👈 Thunder Client-এ এইটা দেখাবে!
            error_code: error.code
        });
    }
};