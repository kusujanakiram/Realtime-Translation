const Conversation = require('../models/ConversationModel');
const User = require('../models/UserModel');
const cloudinary = require('../config/cloudinary');

const createConversation = async (req, res) => {
  try {
    const {
      conversationName,
      purpose,
      person1,
      person2,
      conversationText
    } = req.body;

    const conversationAudio = req.file?.path || ''; // Cloudinary URL

    let parsedPerson1, parsedPerson2;
    try {
      parsedPerson1 = JSON.parse(person1);
      parsedPerson2 = JSON.parse(person2);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid person data format' });
    }

    const newConversation = new Conversation({
      conversationName,
      purpose,
      person1: parsedPerson1,
      person2: parsedPerson2,
      conversationText,
      conversationAudio,
      user: req.user._id
    });

    await newConversation.save();

    const user = await User.findById(req.user._id);
    user.conversations.push(newConversation._id);
    await user.save();

    res.status(201).json({ message: 'Conversation saved!', data: newConversation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save conversation', details: err.message });
  }
};


const getAllConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .sort({ startTime: -1 })  
      .populate('user', 'name email'); 
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations', details: err.message });
  }
};

const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    if (conversation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversation', details: err.message });
  }
};



const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    if (conversation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const publicId = conversation.conversationAudio?.split('/').pop().split('.')[0];

    if (publicId) {
      await cloudinary.uploader.destroy(`anuvadham/${publicId}`, {
        resource_type: 'video',
      });
    }

    await Conversation.findByIdAndDelete(req.params.id);

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { conversations: req.params.id }
    });

    res.json({ message: 'Conversation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete conversation', details: err.message });
  }
};

module.exports = {
  createConversation,
  getAllConversations,
  getConversationById,
  deleteConversation,
};
