const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  language: { type: String, required: true },
  inputType: { type: String, enum: ['voice', 'text'], required: true }
});

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  conversationName: { type: String, required: true },
  purpose: { type: String, required: true },
  person1: { type: participantSchema, required: true },
  person2: { type: participantSchema, required: true },
  startTime: { type: Date, default: Date.now },
  conversationText: { type: String, default: '' },
  conversationAudio: { type: String, default: '' } 
});

module.exports = mongoose.model('Conversation', conversationSchema);
