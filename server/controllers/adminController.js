//const db = require('../config/db');
// @desc    Get all users (with optional status filter)
// @route   GET /api/admin/users?status=Pending
exports.getAllUsers = async (req, res) => {
    try {
        const { status } = req.query; // URL থেকে স্ট্যাটাস ফিল্টার করার জন্য
        
        let query = `SELECT u.id, u.full_name, u.email, u.status, u.created_at, r.role_name 
                     FROM Users u 
                     LEFT JOIN Roles r ON u.role_id = r.id
                     WHERE u.id != 1`;
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
// ==========================================
// 🌟 1. Get All Roles with their Permissions
// ==========================================
exports.getRolesAndPermissions = async (req, res) => {
    try {
        // রোল এবং পারমিশন দুটোই ফেচ করছি
        const [roles] = await req.db.query('SELECT * FROM Roles');
        const [permissions] = await req.db.query('SELECT * FROM Permissions');

        // ফ্রন্টএন্ডে দেখানোর সুবিধার জন্য প্রতিটি রোলের ভেতরে তার পারমিশনগুলো ঢুকিয়ে দিচ্ছি
        const formattedRoles = roles.map(role => {
            return {
                ...role,
                permissions: permissions.filter(p => p.role_id === role.id)
            };
        });

        res.status(200).json({ success: true, data: formattedRoles });
    } catch (error) {
        console.error("Fetch Roles Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch roles." });
    }
};

// ==========================================
// 🌟 2. Update Role Permissions (Matrix Update)
// ==========================================
exports.updateRolePermissions = async (req, res) => {
    const { id } = req.params; // role_id
    const { role_name, permissions } = req.body; 
    // permissions array দেখতে এমন হবে: [{module_name: 'Courses', can_view: 1, can_create: 0, ...}, ...]

    try {
        await req.db.query('BEGIN'); // 🚀 Transaction Start (যাতে অর্ধেক ডাটা সেভ হয়ে ক্র্যাশ না করে)

        // ১. রোলের নাম আপডেট করা (যদি চেঞ্জ করে থাকে)
        if (role_name) {
            await req.db.query('UPDATE Roles SET role_name = ? WHERE id = ?', [role_name, id]);
        }

        // ২. এই রোলের আগের সব পারমিশন ডিলিট করে দেওয়া (Matrix আপডেটের স্ট্যান্ডার্ড নিয়ম)
        await req.db.query('DELETE FROM Permissions WHERE role_id = ?', [id]);

        // ৩. নতুন চেকবক্সের ডাটাগুলো ইনসার্ট করা
        if (permissions && permissions.length > 0) {
            const values = permissions.map(p => [
                id, 
                p.module_name, 
                p.can_view ? 1 : 0, 
                p.can_create ? 1 : 0, 
                p.can_edit ? 1 : 0, 
                p.can_delete ? 1 : 0
            ]);

            // Bulk Insert
            await req.db.query(
                'INSERT INTO Permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES ?',
                [values]
            );
        }

        await req.db.query('COMMIT'); // 🚀 Transaction Save
        res.status(200).json({ success: true, message: "Permissions updated successfully!" });

    } catch (error) {
        await req.db.query('ROLLBACK'); // এরর খেলে ডাটাবেস আগের অবস্থায় ফিরে যাবে
        console.error("Update Permissions Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to update permissions." });
    }
};

