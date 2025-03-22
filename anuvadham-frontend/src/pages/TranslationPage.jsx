import React, { useState, useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowLeft, FaMicrophone } from "react-icons/fa";
import axios from "axios";
import "./TranslationPage.css";
import languageMap from "../languageMap";



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
  const liveCaptionsRef = useRef(null);
  const [micLevel, setMicLevel] = useState(0);
  
  

  const scrollToCaptions = () => {
    if (liveCaptionsRef.current) {
      liveCaptionsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  useEffect(() => {
    let animation;
    if (isListening) {
      animation = setInterval(() => {
        setMicLevel((level) => (level > 10 ? 0 : level + 1));
      }, 200);
    } else {
      setMicLevel(0);
    }
    return () => clearInterval(animation);
  }, [isListening]);
  
  
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
        scrollToCaptions();
        if (!translatedText) {
            alert("❌ Translation failed.");
            setLoading(false);
            return;
        }

        console.log("🔤 Translated Text:", translatedText);
        setTranslatedText(translatedText); // 🔹 Save translated text
        setLiveCaptions(translatedText); // 🔹 Update live captions

        // 🎙 Step 4: Convert Translated Text to Speech (Using OpenAI TTS)
        let lang = languageMap.get(targetLang)
        console.log("🔈 Target Language Code:", languageMap.get(targetLang));
        console.log("Lang test for testing",targetLang);
        const ttsOptions = {
          method: "POST",
          url: "http://localhost:3000/api/synthesize",
          headers: {
              "Content-Type": "application/json"
          },
          data: {
              text: translatedText, // Pass only text
              languageCode: lang || "te-IN" // Ensure correct language code
          }
      };
      
      console.log("🎧 Converting to Speech...");
      const ttsResponse = await axios.request(ttsOptions);
      
      // 🎵 Step 5: Convert and Play Audio
      const base64ToArrayBuffer = (base64) => {
        const binaryString = atob(base64); // Decode Base64
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
      };
      
      const audioBuffer = base64ToArrayBuffer(ttsResponse.data.audioContent);
      const audioBlob = new Blob([audioBuffer], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setTranslatedAudio(audioUrl);
      
      const audio = new Audio(audioUrl);
      audio.play();
      setLoading(false);
      console.log(ttsResponse); // Debugging
      console.log(ttsResponse.data.audioContent);
            
    } catch (error) {
        setLoading(false);
        console.error("❌ API Error:", error);
        alert("Error processing translation & speech.");
    }
};

const handleSpeechInput = async () => {
  try {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setLiveCaptions("🎤 Listening...");

    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(mediaStream, { mimeType: "audio/webm" });
    let audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      setIsListening(false);
      if (audioChunks.length === 0) {
        alert("No audio detected. Please try again.");
        return;
      }

      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(",")[1];

        try {
          const sttResponse = await axios.post("http://localhost:3000/api/speech-to-text", {
            audioContent: base64Audio,
            languageCode: settings.language1,
            alternativeLanguageCodes: [settings.language2],
          });

          const detectedLang = sttResponse.data.detectedLanguage;
          const transcribedText = sttResponse.data.transcribedText;

          if (!transcribedText) {
            alert("Speech recognition failed.");
            return;
          }

          setLiveCaptions(transcribedText);
          console.log("Captured Speech:", transcribedText);

          // Translate text
          let targetLang = detectedLang === settings.language1 ? settings.language2 : settings.language1;
          const translateResponse = await axios.post(
            "https://google-translator9.p.rapidapi.com/v2",
            { q: transcribedText, source: detectedLang, target: targetLang, format: "text" },
            {
              headers: {
                "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
                "x-rapidapi-host": "google-translator9.p.rapidapi.com",
                "Content-Type": "application/json",
              },
            }
          );

          const translatedText = translateResponse.data?.data?.translations?.[0]?.translatedText || "";
          setTranslatedText(translatedText);
          setLiveCaptions(translatedText);

          // Convert to speech
          const lang = languageMap.get(targetLang);
          const ttsResponse = await axios.post("http://localhost:3000/api/synthesize", {
            text: translatedText,
            languageCode: lang || "te-IN",
          });

          const base64ToArrayBuffer = (base64) => {
            const binaryString = atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
          };

          const audioBuffer = base64ToArrayBuffer(ttsResponse.data.audioContent);
          const audioBlob = new Blob([audioBuffer], { type: "audio/mp3" });
          const audioUrl = URL.createObjectURL(audioBlob);

          setTranslatedAudio(audioUrl);
          const audio = new Audio(audioUrl);
          audio.play();
        } catch (error) {
          console.error("Error processing translation:", error);
          alert("Error processing translation.");
        }
      };

      reader.readAsDataURL(audioBlob);
    };

    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
    }, 5000); // Auto-stop after 5 seconds

  } catch (error) {
    console.error("Error in handleSpeechInput:", error);
    setIsListening(false);
  }
};



  return (
    <div className="translation-page">
      {/* ---------- Header remains unchanged ---------- */}
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
  
      {/* ---------- New Main Content Container ---------- */}
      <div className="translation-container">
  {/* ========== Box 1: Text Input (Both Users Choose Text) ========== */}
  {settings?.inputMethod1 === "text" && settings?.inputMethod2 === "text" && (
    <div className="box text-box">
      <h2>Text Input</h2>
      <textarea
        className="text-input"
        placeholder="Type text here..."
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
      ></textarea>

      <div className="button-row">
        <button
          className="send-btn"
          onClick={handleSendText}
          disabled={loading}
        >
          {loading ? "Translating..." : "Send"}
        </button>
      </div>
    </div>
  )}

  {/* ========== Box 2: Voice Input (Both Users Choose Voice) ========== */}
  {settings?.inputMethod1 === "voice" && settings?.inputMethod2 === "voice" && (
    <div className="box voice-box">
      <h2>Voice Input</h2>
      <div className="mic-container">
        {/* Microphone Animation */}
        <div className="mic-level-bars">
          {[...Array(micLevel)].map((_, i) => (
            <motion.div
              key={i}
              className="mic-bar"
              initial={{ height: 0 }}
              animate={{ height: `${(i + 1) * 5}px` }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
        <button
         className={`mic-btn ${isListening ? "recording" : ""}`}
         onClick={handleSpeechInput}>
         <FaMicrophone />
         </button>

      </div>
    </div>
  )}

  {/* ========== Box 3: Mixed Input (Either User Chooses Text or Voice) ========== */}
  {(settings?.inputMethod1 !== settings?.inputMethod2) && (
    <div className="box mixed-box">
      <div className="box text-box">
      <h2>Text Input</h2>
      <textarea
        className="text-input"
        placeholder="Type text here..."
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
      ></textarea>

      <div className="button-row">
        <button
          className="send-btn"
          onClick={handleSendText}
          disabled={loading}
        >
          {loading ? "Translating..." : "Send"}
        </button>
      </div>
    </div>

    <div className="box voice-box">
      <h2>Voice Input</h2>
      <div className="mic-container">
        {/* Microphone Animation */}
        <div className="mic-level-bars">
          {[...Array(micLevel)].map((_, i) => (
            <motion.div
              key={i}
              className="mic-bar"
              initial={{ height: 0 }}
              animate={{ height: `${(i + 1) * 5}px` }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
        <button
        className={`mic-btn ${isListening ? "recording" : ""}`}
        onClick={handleSpeechInput} >
         <FaMicrophone />
        </button>

      </div>
    </div>
    </div>  
  )}
</div>


  
      {/* ---------- Live Captions & Repeat Button ---------- */}
      <motion.div
        ref={liveCaptionsRef}
        className="live-captions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="live-captions-text"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 1 },
            visible: {
              transition: {
                staggerChildren: 0.03,
              },
            },
          }}
        >
          {liveCaptions.split("").map((char, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
        
        <button
          onClick={() => translatedAudio && new Audio(translatedAudio).play()}
          disabled={!translatedAudio}
          className="repeat-btn"
        >
          🔄 Repeat
        </button>
      </motion.div>
  
      {/* ---------- Modal and Footer remain unchanged ---------- */}
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
  
      
    </div>
  );
};  
export default TranslationPage;
