const Notice = require('../models/Notice');

const createNotice = async (req, res) => {
  const { title, content } = req.body;
  const subject = req.user.subject;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    let filePath = '';
    let fileName = '';

    if (req.file) {
      filePath = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
    }

    const notice = await Notice.create({
      title,
      content,
      subject,
      filePath,
      fileName,
      teacher: req.user._id
    });

    const populatedNotice = await Notice.findById(notice._id).populate('teacher', 'name subject');
    res.status(201).json(populatedNotice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private
const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find()
      .populate('teacher', 'name subject')
      .populate('comments.user', 'name role')
      .sort({ createdAt: -1 });
    
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Comment on a notice
// @route   POST /api/notices/:id/comments
// @access  Private
const addComment = async (req, res) => {
  const noticeId = req.params.id;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  try {
    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    const comment = {
      user: req.user._id,
      text
    };

    notice.comments.push(comment);
    await notice.save();

    // Re-fetch populated notice to return the populated comment author
    const updatedNotice = await Notice.findById(noticeId)
      .populate('teacher', 'name subject')
      .populate('comments.user', 'name role');

    res.status(201).json(updatedNotice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNotice,
  getNotices,
  addComment
};
