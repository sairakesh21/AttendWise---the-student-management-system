const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createAssignment,
  getAssignments,
  submitAssignment,
  getSubmissions,
  getStudentHistory,
  addAssignmentComment
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|png|jpg|jpeg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only documents (PDF/DOC/DOCX) and images (PNG/JPG/JPEG) are allowed!'));
    }
  }
});

router.use(protect);

router.route('/')
  .post(authorize('teacher'), upload.single('file'), createAssignment)
  .get(getAssignments);

router.get('/history', authorize('student'), getStudentHistory);

router.post('/:id/submit', authorize('student'), upload.single('file'), submitAssignment);
router.get('/:id/submissions', authorize('teacher'), getSubmissions);
router.post('/:id/comments', addAssignmentComment);

module.exports = router;
