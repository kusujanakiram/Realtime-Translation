import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaMicrophone } from "react-icons/fa";
import axios from "axios";
import "./TranslationPage.css";

const API_URL = "https://ai-translate.p.rapidapi.com/translate";
const SPEECH_TO_TEXT_API = "https://openai-whisper-speech-to-text-api.p.rapidapi.com/transcribe";

const TranslationPage = () => {
  const navigate = useNavigate();
  const [liveCaptions, setLiveCaptions] = useState("Live captions here...");
  const [showExit, setShowExit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [settings, setSettings] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translatedAudio, setTranslatedAudio] = useState(null); // Store translated audio
  const [translatedText, setTranslatedText] = useState(""); // Store translated text

  useEffect(() => {
    const storedSettings = localStorage.getItem("translationSettings");
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        console.log("🔹 Loaded Settings from localStorage:", parsedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error("❌ Error parsing localStorage data:", error);
      }
    } else {
      console.warn("⚠️ No translation settings found in localStorage.");
    }
  }, []);

const handleSendText = async () => {
    console.log("⚡ Current Settings:", settings);

    if (!textInput.trim()) {
        alert("Please enter text to translate.");
        return;
    }

    setLoading(true);

    try {
        // 🌍 Step 1: Detect Language
        const detectOptions = {
            method: "POST",
            url: "https://google-translator9.p.rapidapi.com/v2/detect",
            headers: {
                "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
                "x-rapidapi-host": "google-translator9.p.rapidapi.com",
                "Content-Type": "application/json",
            },
            data: { q: textInput },
        };

        console.log("🔍 Detecting Language...");
        const detectResponse = await axios.request(detectOptions);
        const detectedLang = detectResponse.data?.data?.detections?.[0]?.[0]?.language;

        if (!detectedLang) {
            alert("❌ Unable to detect language.");
            setLoading(false);
            return;
        }

        console.log("✅ Detected Language:", detectedLang);

        // 🛠 Step 2: Determine Translation Target
        let sourceLang = detectedLang;
        let targetLang = detectedLang === settings.language1 ? settings.language2 : settings.language1;

        console.log(`🌐 Translating from ${sourceLang} to ${targetLang}`);

        // 🚀 Step 3: Translate Text
        const translateText = async (text, sourceLang, targetLang) => {
          try {
              const translateOptions = {
                  method: "POST",
                  url: "https://google-translator9.p.rapidapi.com/v2",
                  headers: {
                      "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
                      "x-rapidapi-host": "google-translator9.p.rapidapi.com",
                      "Content-Type": "application/json",
                  },
                  data: {
                      q: text,
                      source: sourceLang,
                      target: targetLang,
                      format: "text",
                  },
              };
      
              console.log("🔄 Sending request to translation API...");
              const response = await axios.request(translateOptions);
              console.log("✅ Translation response:", response.data);
      
              return response.data?.data?.translations?.[0]?.translatedText || "";
          } catch (error) {
              console.error("❌ Translation API Error:", error);
              return "";
          }
      };
      
        const translatedText = await translateText(textInput, sourceLang, targetLang);

        if (!translatedText) {
            alert("❌ Translation failed.");
            setLoading(false);
            return;
        }

        console.log("🔤 Translated Text:", translatedText);
        setTranslatedText(translatedText); // 🔹 Save translated text
        setLiveCaptions(translatedText); // 🔹 Update live captions

        // 🎙 Step 4: Convert Translated Text to Speech (Using OpenAI TTS)
        const ttsOptions = {
            method: "POST",
            url: "https://open-ai-text-to-speech1.p.rapidapi.com/",
            headers: {
                "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
                "x-rapidapi-host": "open-ai-text-to-speech1.p.rapidapi.com",
                "Content-Type": "application/json",
            },
            responseType: "arraybuffer",
            data: {
                model: "tts-1",
                input: translatedText,
                voice: "alloy",
            },
        };

        console.log("🎧 Converting to Speech...");
        const ttsResponse = await axios.request(ttsOptions);

        // 🎵 Step 5: Play & Store Audio
        const audioBlob = new Blob([ttsResponse.data], { type: "audio/mp3" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setTranslatedAudio(audioUrl); // 🔹 Save audio URL

        const audio = new Audio(audioUrl);
        audio.play();

        setLoading(false);
    } catch (error) {
        setLoading(false);
        console.error("❌ API Error:", error);
        alert("Error processing translation & speech.");
    }
};


  const handleSpeechInput = async () => {
    setIsListening(true);
    const options = {
      method: "POST",
      url: SPEECH_TO_TEXT_API,
      headers: {
        "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
        "x-rapidapi-host": "openai-whisper-speech-to-text-api.p.rapidapi.com",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: new URLSearchParams({ type: "RAPID", response_format: "JSON" }),
    };

    try {
      const response = await axios.request(options);
      setIsListening(false);
      if (response.data?.text) {
        setTextInput(response.data.text);
      }
    } catch (error) {
      setIsListening(false);
      console.error("❌ Speech-to-Text API Error:", error);
    }
  };

  return (
    <div className="translation-page">
      <header className="translation-header">
        <div className="header-left">
          <span className="logo">🔵</span>
          <h2>Anuvadham</h2>
        </div>
        <button className="exit-btn" onClick={() => setShowExit(!showExit)}>
          <FaArrowLeft />
        </button>
        {showExit && (
          <motion.button
            className="terminate-btn"
            onClick={() => setShowModal(true)}
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            Terminate
          </motion.button>
        )}
      </header>

      <div className="translation-interface">
        {settings?.inputMethod1 === "text" || settings?.inputMethod2 === "text" ? (
          <div className="text-editor-container">
            <h2>Text Input</h2>
            <textarea
              className="text-input"
              placeholder="Type text here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            ></textarea>
            <button 
            onClick={() => translatedAudio && new Audio(translatedAudio).play()} 
            disabled={!translatedAudio}
             className="repeat-btn">
            🔄 Repeat
            </button>
            <button onClick={handleSendText} disabled={loading}>
              {loading ? "Translating..." : "Send Text"}
            </button>
            <button className="mic-btn" onClick={handleSpeechInput} disabled={isListening}>
              {isListening ? "Listening..." : <FaMicrophone />}
            </button>
          </div>
        ) : (
          <p>No text input method selected.</p>
        )}
      </div>

      <motion.div
        className="live-captions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {liveCaptions}
      </motion.div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Do you want to save this conversation?</h3>
            <div className="modal-buttons">
              <button onClick={() => {}} className="modal-btn download">
                Download
              </button>
              <button onClick={() => navigate("/")} className="modal-btn cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">Footer</footer>
    </div>
  );
};

export default TranslationPage;
