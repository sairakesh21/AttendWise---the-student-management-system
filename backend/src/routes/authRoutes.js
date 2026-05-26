const express = require('express');
const router = express.Router();
const { registerTeacher, loginUser, getMe, updateSettings } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', registerTeacher);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/settings', protect, updateSettings);

module.exports = router;
