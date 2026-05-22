const express = require('express');
const router = express.Router();
const { registerTeacher, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', registerTeacher);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

module.exports = router;
