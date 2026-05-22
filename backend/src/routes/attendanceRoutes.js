const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getTeacherReport,
  getStudentReport
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('teacher'), markAttendance);
router.get('/teacher-report', authorize('teacher'), getTeacherReport);
router.get('/student-report', authorize('student'), getStudentReport);

module.exports = router;
