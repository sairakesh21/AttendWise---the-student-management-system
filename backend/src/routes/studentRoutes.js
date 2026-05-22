const express = require('express');
const router = express.Router();
const { addStudent, getStudents } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('teacher'));

router.route('/')
  .post(addStudent)
  .get(getStudents);

module.exports = router;
