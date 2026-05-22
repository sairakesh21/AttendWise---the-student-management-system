const User = require('../models/User');

// @desc    Add a new student account
// @route   POST /api/students
// @access  Private/Teacher
const addStudent = async (req, res) => {
  const { name, email, password, rollNumber } = req.body;

  try {
    const studentExists = await User.findOne({ 
      $or: [{ email }, { rollNumber }] 
    });

    if (studentExists) {
      return res.status(400).json({ 
        message: 'Student with this email or roll number already exists' 
      });
    }

    const student = await User.create({
      name,
      email,
      password,
      role: 'student',
      rollNumber,
      addedBy: req.user._id
    });

    res.status(201).json({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: student.role,
      rollNumber: student.rollNumber,
      addedBy: student.addedBy
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Teacher
const getStudents = async (req, res) => {
  try {
    // Return all students so any teacher can view and mark attendance
    const students = await User.find({ role: 'student' }).select('-password').sort({ name: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addStudent,
  getStudents
};
