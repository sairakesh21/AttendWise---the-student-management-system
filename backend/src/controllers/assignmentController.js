const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Teacher
const createAssignment = async (req, res) => {
  const { title, description, deadline, notes } = req.body;
  const subject = req.user.subject;

  if (!title || !description || !deadline) {
    return res.status(400).json({ message: 'Title, description and deadline are required' });
  }

  try {
    let filePath = '';
    let fileName = '';

    if (req.file) {
      filePath = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
    }

    // Set deadline to the end of the day (23:59:59)
    const deadlineDate = new Date(`${deadline}T23:59:59`);

    const assignment = await Assignment.create({
      title,
      description,
      subject,
      deadline: deadlineDate,
      notes,
      filePath,
      fileName,
      teacher: req.user._id
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private (Teacher sees their own; Student sees all)
const getAssignments = async (req, res) => {
  try {
    let assignments;
    if (req.user.role === 'teacher') {
      assignments = await Assignment.find({ teacher: req.user._id })
        .populate('comments.user', 'name role')
        .sort({ createdAt: -1 });
    } else {
      // Students see all assignments
      assignments = await Assignment.find()
        .populate('teacher', 'name subject')
        .populate('comments.user', 'name role')
        .sort({ deadline: 1 });
    }
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit an assignment
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
const submitAssignment = async (req, res) => {
  const assignmentId = req.params.id;
  const studentId = req.user._id;

  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an assignment file' });
  }

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student already submitted this assignment
    const alreadySubmitted = await Submission.findOne({
      assignment: assignmentId,
      student: studentId
    });

    if (alreadySubmitted) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    // Determine status (Late or Submitted)
    const now = new Date();
    const status = now > new Date(assignment.deadline) ? 'Late' : 'Submitted';

    const submission = await Submission.create({
      assignment: assignmentId,
      student: studentId,
      filePath: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      submittedAt: now,
      status
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get submissions for a specific assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private/Teacher
const getSubmissions = async (req, res) => {
  const assignmentId = req.params.id;

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Ensure teacher owns this assignment
    if (assignment.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these submissions' });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'name email rollNumber')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get submission history for the logged-in student
// @route   GET /api/assignments/history
// @access  Private/Student
const getStudentHistory = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id })
      .populate({
        path: 'assignment',
        select: 'title subject deadline'
      })
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Comment on an assignment
// @route   POST /api/assignments/:id/comments
// @access  Private
const addAssignmentComment = async (req, res) => {
  const assignmentId = req.params.id;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const comment = {
      user: req.user._id,
      text
    };

    assignment.comments.push(comment);
    await assignment.save();

    // Re-fetch populated assignment to return the populated comment author
    const updatedAssignment = await Assignment.findById(assignmentId)
      .populate('teacher', 'name subject')
      .populate('comments.user', 'name role');

    res.status(201).json(updatedAssignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  submitAssignment,
  getSubmissions,
  getStudentHistory,
  addAssignmentComment
};
