const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserStatus,updateUserDetails,getRolesAndPermissions,
    updateRolePermissions } = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// এই রাউটের সবকিছু সুরক্ষিত (প্রথমে টোকেন চেক করবে, তারপর অ্যাডমিন কি না চেক করবে)
router.use(verifyToken, isAdmin);

// Routes
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);

router.put('/users/:id', updateUserDetails);
router.get('/roles', getRolesAndPermissions);
router.put('/roles/:id/permissions', updateRolePermissions);

module.exports = router;