const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {audioUploader} = require('../middleware/cloudinaryUploader'); // Import the uploader

const {
  createConversation,
  getAllConversations,
  getConversationById,
  deleteConversation,
} = require('../controllers/conversationController');

// Routes
router.post('/', protect, audioUploader.single('audio'), createConversation);
router.get('/', protect, getAllConversations);
router.get('/:id', protect, getConversationById);
router.delete('/:id', protect, deleteConversation);
module.exports = router;
