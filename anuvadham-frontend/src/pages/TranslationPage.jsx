import React, { useState, useEffect,useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as WaveSurfer from "wavesurfer.js";
import { motion } from "framer-motion";
import { FaArrowLeft, FaMicrophone, FaStop } from "react-icons/fa";
import axios from "axios";
import "./TranslationPage.css";
import languageMap from "../languageMap";
import languageNameMap from "../languageNameMap";



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
  const allAudioBlobs = [];
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const textRef = useRef(""); // Stores full translated text
  const audioChunksRef = useRef([]);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const allAudioBlobsRef = useRef([]);
  let mergedAudioRef = useRef(null);
  let mergedText = useRef("");
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) navigate('/');
    }, []);

const appendToMergedText = (text, type) => {
  if (type == "original") {
    mergedText.current += `Original: ${text}\n`;
  } else if (type == "translated") {
    mergedText.current += `Translated: ${text}\n\n`;
  }
};

const mergeAudioBlobs = async (audioBlobs) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const decodedBuffers = [];

  for (const blob of audioBlobs) {
    if (blob && blob.size > 0) {
      const arrayBuffer = await blob.arrayBuffer();
      try {
        const decoded = await audioContext.decodeAudioData(arrayBuffer);
        decodedBuffers.push(decoded);
      } catch (err) {
        console.warn("❌ Failed to decode blob:", err);
      }
    }
  }

  if (decodedBuffers.length === 0) {
    console.warn("⚠️ No valid audio buffers to merge.");
    return;
  }

  const totalLength = decodedBuffers.reduce((sum, buf) => sum + buf.length, 0);
  const numberOfChannels = Math.max(...decodedBuffers.map(buf => buf.numberOfChannels));
  const sampleRate = audioContext.sampleRate;

  const mergedBuffer = audioContext.createBuffer(numberOfChannels, totalLength, sampleRate);
  let offset = 0;

  decodedBuffers.forEach(buffer => {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = mergedBuffer.getChannelData(channel);
      channelData.set(buffer.getChannelData(channel % buffer.numberOfChannels), offset);
    }
    offset += buffer.length;
  });

  // Convert merged buffer to WAV Blob
  const mergedBlob = await audioBufferToWavBlob(mergedBuffer);
  mergedAudioRef.current = mergedBlob; // 🔁 Store in global ref
  console.log("✅ Merged audio stored in mergedAudioRef:", mergedBlob);
};

// Exported helper to convert AudioBuffer to WAV Blob
const audioBufferToWavBlob = (buffer) => {
  return new Promise(resolve => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferOut = new ArrayBuffer(length);
    const view = new DataView(bufferOut);
    const channels = [], sampleRate = buffer.sampleRate;

    let pos = 0;
    const writeStr = (str) => { for (let i = 0; i < str.length; i++) view.setUint8(pos++, str.charCodeAt(i)); };
    const write16 = (val) => { view.setUint16(pos, val, true); pos += 2; };
    const write32 = (val) => { view.setUint32(pos, val, true); pos += 4; };

    writeStr('RIFF'); write32(length - 8); writeStr('WAVE');
    writeStr('fmt '); write32(16); write16(1); write16(numOfChan);
    write32(sampleRate); write32(sampleRate * numOfChan * 2);
    write16(numOfChan * 2); write16(16);
    writeStr('data'); write32(length - pos - 4);

    for (let i = 0; i < numOfChan; i++) channels.push(buffer.getChannelData(i));

    for (let i = 0; i < buffer.length; i++) {
      for (let c = 0; c < numOfChan; c++) {
        let sample = Math.max(-1, Math.min(1, channels[c][i]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
    }

    resolve(new Blob([view], { type: 'audio/wav' }));
  });
};

  const [lang, setLang] = useState(settings?.language1);
  useEffect(() => {
    const storedSettings = localStorage.getItem("translationSettings");
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        console.log("🔹 Loaded Settings from localStorage:", parsedSettings);
        setSettings(parsedSettings);
        setLang(parsedSettings.language1 || "en-IN");
      } catch (error) {
        console.error("❌ Error parsing localStorage data:", error);
        setLang("en-IN");
      }
    } else {
      console.warn("⚠️ No translation settings found in localStorage.");
      setLang("en-IN");
    }
  }, []);

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

  const visualizeMicrophoneInput = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
  
    const canvas = waveformRef.current;
    const canvasCtx = canvas.getContext("2d");
    canvas.width = 500;
    canvas.height = 100;
  
    const drawWaveform = () => {
      requestAnimationFrame(drawWaveform);
      analyser.getByteFrequencyData(dataArray); // Use frequency data instead
      
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx.fillStyle = "white";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    
      const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "#007bff"); // Light blue
      gradient.addColorStop(0.5, "rgba(12, 105, 198, 0.5)"); // White for a soft transition
      gradient.addColorStop(1, "blue"); // Royal blue
      
      canvasCtx.strokeStyle = gradient;
      canvasCtx.shadowBlur = 15;
      canvasCtx.shadowColor = "rgba(34, 102, 170, 0.5)"; // Soft blue glow
      canvasCtx.lineWidth = 3; 
      
      canvasCtx.beginPath();
    
      let sliceWidth = canvas.width / bufferLength;
      let x = 0;
    
      for (let i = 0; i < bufferLength; i++) {
        let v = dataArray[i] / 255.0; // Normalize (0 to 1)
        let y = (v * canvas.height) / 2; // Scale for height
        
        let centerY = canvas.height / 2;
    
        if (i === 0) {
          canvasCtx.moveTo(x, centerY - y);
        } else {
          canvasCtx.lineTo(x, centerY - y);
        }
    
        // Draw the mirrored waveform
        canvasCtx.lineTo(x, centerY + y);
    
        x += sliceWidth;
      }
    
      canvasCtx.stroke();
    };
    
  
    drawWaveform();
  };
  

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
        appendToMergedText(textInput, "original");
        console.log("merged text :",mergedText)
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
        appendToMergedText(translatedText, "translated"); // Append translated text to merged text
        console.log("merged text :",mergedText)
        setTranslatedText(translatedText); // 🔹 Save translated text
        setLiveCaptions(translatedText); // 🔹 Update live captions

        // 🎙 Step 4: Convert Translated Text to Speech (Using OpenAI TTS)
         languageMap.get(targetLang)
        console.log("🔈 Target Language Code:", languageMap.get(targetLang));
        console.log("Lang test for testing",targetLang);
        const ttsOptions = {
          method: "POST",
          url: `${API_BASE_URL}/api/synthesize`,
          headers: {
              "Content-Type": "application/json"
          },
          data: {
              text: translatedText, // Pass only text
              languageCode: languageMap.get(targetLang) || "te-IN" // Ensure correct language code
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
      allAudioBlobsRef.current.push(audioBlob);
      console.log("merge audio length:", allAudioBlobsRef.current?.length);
      await mergeAudioBlobs(allAudioBlobsRef.current);
      console.log("merge audio length : ",mergedAudioRef.length)
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setTranslatedAudio(audioUrl);
      
      const audio = new Audio(audioUrl);
      audio.play();
      setLoading(false);
      console.log(ttsResponse); // Debugging
      console.log("Translation Audio Length : ",ttsResponse.data.audioContent.length);
            
    } catch (error) {
        setLoading(false);
        console.error("❌ API Error:", error);
        alert("Error processing translation & speech.");
    }
};

const handleSpeechInput = async () => {
  if (!isListening) {
    setIsListening(true);
    setLiveCaptions("Listening...");
    console.log("🎤 Microphone activated. Recording started...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("✅ Microphone access granted.");
      visualizeMicrophoneInput(stream);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log("🔹 Audio chunk received:", event.data.size, "bytes");
        }
      };

      mediaRecorder.onstop = async () => {
        console.log("⏹️ Recording stopped.");
        setIsListening(false);

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        allAudioBlobs.push(audioBlob);
        console.log("🔹 Audio blob created:", audioBlob.size, "bytes");
        setAudioBlob(audioBlob);
        console.log("✅ Audio recorded:", audioBlob);
        
        try {
          allAudioBlobsRef.current.push(audioBlob);
          console.log("merge audio length:", allAudioBlobsRef.current?.length);
          await mergeAudioBlobs(allAudioBlobsRef.current);
          const audioBase64 = await convertBlobToBase64(audioBlob);
          console.log("🎵 Audio converted to Base64:", audioBase64.slice(0, 50) + "...");

          const transcript = await transcribeAudio(audioBase64);
          appendToMergedText(transcript, "original"); // Append original text to merged text
          console.log("merged text in transcribe : ",mergedText)
          setTranslatedText(transcript);
          setLiveCaptions(transcript);
          scrollToCaptions();

          if (!transcript) {
            alert("❌ Transcription failed.");
            setLoading(false);
            return;
          }

          let sourceLang = lang; 
          let targetLang = lang == settings.language1 ? settings.language2 : settings.language1;
          const translatedText = await translateText(transcript, sourceLang, targetLang);
          if (!translatedText) {
            alert("❌ Translation failed.");
            setLoading(false);
            return;
          }

          console.log("🔤 Translated Text:", translatedText);
          appendToMergedText(translatedText, "translated"); // Append translated text to merged text
          console.log("merged text in translate : ",mergedText)
          setTranslatedText(translatedText);
          setLiveCaptions(translatedText);
          scrollToCaptions();
          const targetLangCode = languageMap.get(targetLang) || "te-IN";
          console.log("🔈 Target Language Code:", targetLangCode);

          await synthesizeSpeech(translatedText, targetLangCode);
          allAudioBlobs.push(translatedAudio);
        } catch (error) {
          console.error("❌ Processing Error:", error);
          alert("Error processing translation & speech.");
        }
        setLoading(false);
      };

      mediaRecorder.start();
      console.log("🎙️ Recording started...");
    } catch (error) {
      console.error("❌ Error accessing microphone:", error);
      setIsListening(false);
    }
  } else {
    setIsListening(false);
    setLiveCaptions("Processing...");
    console.log("⏹️ Stopping recording...");

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }
};

const convertBlobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
};

const transcribeAudio = async (audioContent) => {
  if (!settings) {
    console.error("⚠️ Language settings not loaded.");
    return null;
  }

  const languageCode = languageMap.get(lang) ;
  const alternativeLanguageCodes = [languageMap.get(settings.language2), languageMap.get(settings.language1)] ;

  console.log("📤 Sending audio to API...");

  try {
    const response = await fetch(`${API_BASE_URL}/api/speech-to-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioContent, languageCode, alternativeLanguageCodes }),
    });

    const data = await response.json();
    console.log("✅ API Response:", data);

    return data.transcript || null;
  } catch (error) {
    console.error("❌ API request failed:", error);
    return null;
  }
};

const translateText = async (text, sourceLang, targetLang) => {
  try {
    const response = await axios.post("https://google-translator9.p.rapidapi.com/v2", {
      q: text,
      source: sourceLang,
      target: targetLang,
      format: "text",
    }, {
      headers: {
        "x-rapidapi-key": import.meta.env.VITE_RAPIDAPI_KEY,
        "x-rapidapi-host": "google-translator9.p.rapidapi.com",
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Translation response:", response.data);
    return response.data?.data?.translations?.[0]?.translatedText || "";
  } catch (error) {
    console.error("❌ Translation API Error:", error);
    return "";
  }
};

const synthesizeSpeech = async (text, languageCode) => {
  try {
    console.log("🎧 Converting to Speech...");

    const response = await axios.post(`${API_BASE_URL}/api/synthesize`, {
      text,
      languageCode,
    }, {
      headers: { "Content-Type": "application/json" },
    });

    const audioBuffer = base64ToArrayBuffer(response.data.audioContent);
    const audioBlob = new Blob([audioBuffer], { type: "audio/mp3" });
    allAudioBlobs.push(audioBlob);
    console.log("🔹 Audio blob created:", audioBlob.size, "bytes");
    allAudioBlobsRef.current.push(audioBlob);
    console.log("merge audio length:", allAudioBlobsRef.current?.length);
    await mergeAudioBlobs(allAudioBlobsRef.current);
    const audioUrl = URL.createObjectURL(audioBlob);

    setTranslatedAudio(audioUrl);
    new Audio(audioUrl).play();
  } catch (error) {
    console.error("❌ TTS API Error:", error);
  }
};

const base64ToArrayBuffer = (base64) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
const handleExit = async () => {
  try {
    const formData = new FormData();
    formData.append('conversationName', settings.conversationName);
    formData.append('purpose', settings.purpose);

    formData.append('person1', JSON.stringify({
      language: languageNameMap.get(settings?.language1),
      inputType: settings.inputMethod1
    }));
    formData.append('person2', JSON.stringify({
      language: languageNameMap.get(settings?.language2) ,
      inputType: settings.inputMethod2
    }));

    formData.append('conversationText', mergedText.current);
    formData.append('audio', new File([mergedAudioRef.current], 'conversation.wav', { type: 'audio/wav' }));

    const res = await axios.post(`${API_BASE_URL}/api/conversations`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    console.log("✅ Saved to DB:", res.data);
    alert("Conversation saved!");
  } catch (err) {
    console.error("❌ Error saving:", err);
    alert("Failed to save conversation.");
  }

  // 🚀 Redirect
  navigate("/home");
}

const handleDownloadAll = async () => {
  // 🔉 Download Merged Audio
  if (mergedAudioRef.current) {
    console.log("🔹 Merged Audio Blob:", mergedAudioRef.current.size, "bytes");
    downloadBlob(mergedAudioRef.current, "conversation.wav");
  } else {
    console.log("⚠️ No merged audio available to download.");
  }

  // 📝 Download Merged Text
  if (mergedText.current && mergedText.current.trim() !== "") {
    const textBlob = new Blob([mergedText.current], { type: 'text/plain' });
    console.log("🔹 Merged Text Blob:", textBlob.size, "bytes");
    downloadBlob(textBlob, "conversation.txt");
  } else {
    console.log("⚠️ No text content to download.");
  }

  await handleExit()
};

  return (
    <div className="translation-page">
      {/* ---------- Header remains unchanged ---------- */}
      <header className="header">
        <div className="logo">
          <img src="images\AnuvadhamLogo.png" alt="Logo" />
          <span>Anuvadham</span>
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
    <h2>Voice</h2>
    <div className="language-selector">
    <label>Select Language: </label>
    <select value={lang} onChange={(e) => setLang(e.target.value)}>
      <option value={settings?.language1 || "en-IN"}>{languageNameMap.get(settings?.language1) || "English"}</option>
      <option value={settings?.language2 || "hi-IN"}>{languageNameMap.get(settings?.language2) || "Hindi"}</option>
    </select>
  </div>
  <div className="waveform-circle">
{!isListening ? (
  <div className="waveform-placeholder">
  <div className="speak-text">
    <div className="mic-icon"><FaMicrophone /></div> 
    <div>
      Let us talk 
      <span className="dots">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </div>
  </div>
</div>
) : (
  <canvas ref={waveformRef} className="waveform-canvas"></canvas>
)}
</div>
    <button
     className={`mic-btn ${isListening ? "recording" : ""}`}
     onClick={handleSpeechInput}>
     {isListening ? <FaStop /> : <FaMicrophone />}
     </button>
  </div>

  )}

  {/* ========== Box 3: Mixed Input (Either User Chooses Text or Voice) ========== */}
  {(settings?.inputMethod1 !== settings?.inputMethod2) && (
   <div className="mixed-box">
   <div className="box text-box">
     <h2>Text</h2>
 
     <div className="text-input-wrapper">
       <textarea
         className="text-input"
         value={textInput}
         onChange={(e) => setTextInput(e.target.value)}
       ></textarea>
 
       {textInput === "" && (
         <div className="text-placeholder">
           <span>Let us chat</span>
           <span className="dots">
             <span></span>
             <span></span>
             <span></span>
           </span>
         </div>
       )}
     </div>
 
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
      <h2>Voice</h2>
      <div className="language-selector">
      <label>Select Language: </label>
      <select value={lang} onChange={(e) => setLang(e.target.value)}>
        <option value={settings?.language1 || "en-IN"}>{languageNameMap.get(settings?.language1) || "English"}</option>
        <option value={settings?.language2 || "hi-IN"}>{languageNameMap.get(settings?.language2) || "Hindi"}</option>
      </select>
    </div>
    <div className="waveform-circle">
  {!isListening ? (
    <div className="waveform-placeholder">
    <div className="speak-text">
      <div className="mic-icon"><FaMicrophone /></div> 
      <div>
        Let us talk 
        <span className="dots">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </div>
    </div>
  </div>
  ) : (
    <canvas ref={waveformRef} className="waveform-canvas"></canvas>
  )}
</div>
      <button
       className={`mic-btn ${isListening ? "recording" : ""}`}
       onClick={handleSpeechInput}>
       {isListening ? <FaStop /> : <FaMicrophone />}
       </button>
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
      <div className="mobile-bottom-spacer"></div>

  
      {/* ---------- Modal and Footer remain unchanged ---------- */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Do you want to save this conversation?</h3>
            <div className="modal-buttons">
              <button onClick={handleDownloadAll} className="modal-btn download">
                Download
              </button>
              <button onClick={handleExit} className="modal-btn cancel">
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