const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const apiKey = process.env.API_KEY;
const MONGO = process.env.MONGO_URI;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}));

const userRoutes = require('./routes/userRoute');
const conversationRoutes = require('./routes/conversationRoutes');

mongoose.connect(MONGO)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((error) => console.log(error));

app.use('/api/auth', userRoutes);
app.use('/api/conversations', conversationRoutes);

if (!apiKey) {
  console.error("❌ API Key is missing. Check your .env file!");
  process.exit(1);
}

const defaultSTTLanguage = "en-IN";
const alternativeLanguages = ["hi-IN"];

app.post("/api/speech-to-text", async (req, res) => {
  let { audioContent, languageCode, alternativeLanguageCodes } = req.body;

  console.log("✅ Received Speech-to-Text Request:");
  console.log("🎤 Language Code:", languageCode);
  console.log("🌐 Alternative Languages:", alternativeLanguageCodes);

  if (!audioContent) {
    console.error("❌ No audio content received.");
    return res.status(400).json({ error: "Audio content is required" });
  }

  languageCode = languageCode || defaultSTTLanguage;
  alternativeLanguageCodes = alternativeLanguageCodes || alternativeLanguages;

  const url = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;
  const requestBody = {
    config: {
      encoding: "MP3",
      sampleRateHertz: 24000,
      languageCode,
      alternativeLanguageCodes,
    },
    audio: { content: audioContent },
  };

  try {
    const response = await axios.post(url, requestBody);
    if (!response.data.results || response.data.results.length === 0) {
      console.error("❌ No transcription results.");
      return res.status(500).json({ error: "No transcription results found." });
    }

    const transcript = response.data.results
      .map(result => result.alternatives[0]?.transcript)
      .join(" ") || "No transcription available";

    const detectedLanguage = response.data.results[0]?.languageCode || languageCode;
    console.log("🌍 Detected Language:", detectedLanguage);

    res.json({ transcript, detectedLanguage });
  } catch (error) {
    console.error("❌ Speech-to-Text Error:");
    if (error.response) {
      console.error("🚨 API Response Error Status:", error.response.status);
      return res.status(500).json(error.response.data);
    } else {
      console.error("⚠️ General Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }
});

app.post('/api/synthesize', async (req, res) => {
  let { text, languageCode } = req.body;

  if (!text) return res.status(400).json({ error: 'Text field is required' });

  languageCode = languageCode || "en-IN";  // Default language code for TTS

  const url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`;
  const requestBody = {
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0.0,
    },
    input: { text },
    voice: { languageCode }
  };

  try {
    const response = await axios.post(url, requestBody);
    res.json({ audioContent: response.data.audioContent });
  } catch (error) {
    console.error("❌ Text-to-Speech Error:", error.response ? error.response.data : error.message);
    res.status(500).send('Error generating speech');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
