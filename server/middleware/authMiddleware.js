const jwt = require('jsonwebtoken');

// ১. চেক করবে ইউজারের কাছে ভ্যালিড টোকেন আছে কি না
exports.verifyToken = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access Denied. No token provided.' });
    }

    try {
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trimLeft();
        }
        
        // টোকেন ডিকোড করা
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // ডিকোড করা ডেটা (id, role_id, role_name) req.user এ রেখে দিলাম
        next();
    } catch (error) {
        res.status(400).json({ success: false, message: 'Invalid or Expired Token.' });
    }
};

// ২. চেক করবে ইউজারটি অ্যাডমিন কি না
exports.isAdmin = (req, res, next) => {
    // role_name 'Admin' অথবা role_id 1 হতে হবে
    if (req.user && (req.user.role_name === 'Admin' || req.user.role_id === 1)) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access Denied. Admin privileges required.' });
    }
};
exports.isInstructor = (req, res, next) => {
    // role_id 1 (Admin) অথবা 2 (Instructor) দুজনেই এই প্যানেল দেখতে পারবে
    if (req.user && (req.user.role_id === 2 || req.user.role_id === 1)) {
        next();
    } else {
        res.status(403).json({ success: false, message: "Access denied. Instructor only." });
    }
};
// ৩. চেক করবে ইউজারটি স্টুডেন্ট কি না
exports.isStudent = (req, res, next) => {
    // role_id 3 (Student) অথবা 1 (Admin) দুজনেই স্টুডেন্ট রাউট এক্সেস করতে পারবে
    if (req.user && (req.user.role_id === 3 || req.user.role_id === 1)) {
        next();
    } else {
        res.status(403).json({ success: false, message: "Access denied. Student only." });
    }
};