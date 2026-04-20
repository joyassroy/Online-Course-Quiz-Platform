const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    try {
        const { full_name, email, password, role_id } = req.body;

        // ১. বেসিক ভ্যালিডেশন
        if (!full_name || !email || !password || !role_id) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
        }

        // ২. চেক করা ইমেইলটি আগে থেকে আছে কি না
        const [existingUsers] = await req.db.query('SELECT email FROM Users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'Email is already registered.' });
        }

        // ৩. পাসওয়ার্ড হ্যাস (Hash) করা
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ৪. ডাটাবেসে সেভ করা (ডিফল্ট স্ট্যাটাস 'Pending' থাকবে ডাটাবেস স্কিমা অনুযায়ী)
        const [result] = await req.db.query(
            'INSERT INTO Users (full_name, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
            [full_name, email, hashedPassword, role_id]
        );

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please wait for Admin approval.',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password.' });
        }

        // ১. ইউজার ফাইন্ড করা (Role সহ জয়েন করে)
        const [users] = await req.db.query(
            `SELECT u.*, r.role_name 
             FROM Users u 
             LEFT JOIN Roles r ON u.role_id = r.id 
             WHERE u.email = ?`, 
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const user = users[0];

        // ২. ইউজারের স্ট্যাটাস চেক করা (অ্যাসেসমেন্ট রিকয়ারমেন্ট: Pending/Rejected হলে লগইন করতে পারবে না)
        if (user.status === 'Pending') {
            return res.status(403).json({ success: false, message: 'Your account is pending admin approval.' });
        }
        if (user.status === 'Rejected' || user.status === 'Suspended') {
            return res.status(403).json({ success: false, message: `Account ${user.status}. Reason: ${user.admin_remark || 'Not specified'}` });
        }

        // ৩. পাসওয়ার্ড ম্যাচ করা
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        // ৪. JWT টোকেন জেনারেট করা
        const payload = {
            id: user.id,
            role_id: user.role_id,
            role_name: user.role_name
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        });

        // পাসওয়ার্ড বাদ দিয়ে বাকি ডেটা রেসপন্সে পাঠানো
        delete user.password_hash;

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login.' });
    }
};