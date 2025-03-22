const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;
const apiKey = process.env.API_KEY;

app.use(express.json());
app.use(cors());

// Default settings
const defaultTTSLanguage = "te-IN";
const defaultSTTLanguage = "en-IN";
const alternativeLanguages = ["hi-IN"]; // Supports Hindi as an alternative

// Speech-to-Text (STT) - Convert Speech to Text
app.post('/api/speech-to-text', async (req, res) => {
  let { audioContent, languageCode, alternativeLanguageCodes } = req.body;

  if (!audioContent) {
    return res.status(400).json({ error: 'Audio content is required' });
  }

  // Default primary language
  languageCode = languageCode || defaultLanguageCode;
  // Default alternative languages if none are provided
  alternativeLanguageCodes = alternativeLanguageCodes || ["hi-IN"]; 

  console.log("✅ Received Speech-to-Text Request:", { languageCode, alternativeLanguageCodes });

  const url = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;

  const requestBody = {
    config: {
      encoding: 'MP3', // Adjust format if necessary (MP3, FLAC, etc.)
      sampleRateHertz: 16000,
      languageCode,  // Primary language
      alternativeLanguageCodes,  // List of alternative languages
      enableAutomaticPunctuation: true,
    },
    audio: {
      content: audioContent,
    },
  };

  console.log("🔵 Sending request to Google API:", requestBody);

  try {
    const response = await axios.post(url, requestBody);
    console.log("✅ Speech-to-Text API Response:", response.data);

    const transcript = response.data.results
      ?.map(result => result.alternatives[0]?.transcript)
      .join(' ') || 'No transcription available';

    const detectedLanguage = response.data.results[0]?.languageCode || languageCode;

    res.json({ transcript, detectedLanguage });
  } catch (error) {
    console.error("❌ Speech-to-Text Error:", error.response ? error.response.data : error.message);
    res.status(500).send('Error processing speech-to-text');
  }
});

// Text-to-Speech (TTS) - Convert Text to Speech
app.post('/api/synthesize', async (req, res) => {
  let { text, languageCode } = req.body;

  if (!text) return res.status(400).json({ error: 'Text field is required' });

  languageCode = languageCode || defaultTTSLanguage;

  console.log("✅ Text-to-Speech Request:", { text, languageCode });

  const url = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`;
  
  const requestBody = {
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.0,
      pitch: 0.0
    },
    input: { text },
    voice: { languageCode}
  };

  try {
    const response = await axios.post(url, requestBody);
    console.log("✅ TTS API Response:", response.data);

    res.json({ audioContent: response.data.audioContent });
  } catch (error) {
    console.error("❌ Text-to-Speech Error:", error.response ? error.response.data : error.message);
    res.status(500).send('Error generating speech');
  }
});

// ✅ Start Express Server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
