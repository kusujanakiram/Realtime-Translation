const Conversation = require('../models/ConversationModel');

// POST: Save a new conversation
const createConversation = async (req, res) => {
  try {
    const {
      conversationName,
      purpose,
      person1,
      person2,
      conversationText
    } = req.body;

    const conversationAudio = req.file ? `/uploads/${req.file.filename}` : '';

    const newConversation = new Conversation({
      conversationName,
      purpose,
      person1: JSON.parse(person1),
      person2: JSON.parse(person2),
      conversationText,
      conversationAudio
    });

    await newConversation.save();
    res.status(201).json({ message: 'Conversation saved!', data: newConversation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save conversation', details: err.message });
  }
};

// GET: All conversations (for full list display)
const getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({ startTime: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations', details: err.message });
  }
};

// GET: Last 3 conversations only (for home page / recent)
const getLastThreeConversations = async (req, res) => {
  try {
    const lastThree = await Conversation.find().sort({ startTime: -1 }).limit(3);
    res.json(lastThree);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch last 3 conversations', details: err.message });
  }
};

module.exports = {
  createConversation,
  getAllConversations,
  getLastThreeConversations
};
