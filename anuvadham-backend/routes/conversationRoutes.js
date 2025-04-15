const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  createConversation,
  getAllConversations,
  getLastThreeConversations
} = require('../controllers/conversationController');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname) === '.wav') {
    cb(null, true);
  } else {
    cb(new Error('Only .wav files are allowed!'));
  }
};

const upload = multer({ storage, fileFilter });

// Routes
router.post('/', upload.single('audio'), createConversation);
router.get('/', getAllConversations);
router.get('/latest', getLastThreeConversations);

module.exports = router;
