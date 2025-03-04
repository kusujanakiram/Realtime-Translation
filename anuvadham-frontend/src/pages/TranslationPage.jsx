import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TranslationPage.css';

const TranslationPage = () => {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState('');
  const [conversationName, setConversationName] = useState('');
  const [language1, setLanguage1] = useState('');
  const [language2, setLanguage2] = useState('');
  const [inputMethod1, setInputMethod1] = useState('text');
  const [inputMethod2, setInputMethod2] = useState('text');
  const [isTranslating, setIsTranslating] = useState(false);
  const [liveCaptions, setLiveCaptions] = useState('');
  const [showModal, setShowModal] = useState(false);

  const startTranslation = () => {
    // Validate required fields
    if (!purpose || !conversationName || !language1 || !language2) {
      alert('Please fill all required fields.');
      return;
    }
    setIsTranslating(true);
    // Clear previous captions
    setLiveCaptions('');
    // Start live caption simulation or integration with speech-to-text API
  };

  const stopTranslation = () => {
    setIsTranslating(false);
    // Process translation output, here simulated with dummy text
    setLiveCaptions('Translated text will appear here...');
  };

  const handleExit = () => {
    // Show the confirmation modal when exit is clicked
    setShowModal(true);
  };

  const confirmExit = () => {
    // Simulate downloading audio and then navigate back to home
    alert('Downloading audio...');
    navigate('/');
  };

  const cancelExit = () => {
    setShowModal(false);
  };

  return (
    <div className="translation-page">
      {/* Header with exit button */}
      <header className="translation-header">
        <button className="exit-btn" onClick={handleExit}>X</button>
        <h1>Real-Time Translation</h1>
      </header>

      {/* Pre-Conversation Setup */}
      <div className="setup-section">
        <div className="setup-field">
          <label htmlFor="purpose">Purpose:</label>
          <input 
            type="text" 
            id="purpose" 
            value={purpose} 
            onChange={(e) => setPurpose(e.target.value)} 
            placeholder="e.g., Business, Travel" 
          />
        </div>
        <div className="setup-field">
          <label htmlFor="conversationName">Conversation Name:</label>
          <input 
            type="text" 
            id="conversationName" 
            value={conversationName} 
            onChange={(e) => setConversationName(e.target.value)} 
            placeholder="Enter conversation name" 
          />
        </div>
      </div>

      {/* Language & Input Selection */}
      <div className="language-selection">
        {/* Person 1 */}
        <div className="participant">
          <h2>Person 1</h2>
          <div className="setup-field">
            <label htmlFor="language1">Language:</label>
            <select 
              id="language1" 
              value={language1} 
              onChange={(e) => setLanguage1(e.target.value)}
            >
              <option value="">Select Language</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              {/* More options can be added */}
            </select>
          </div>
          <div className="setup-field">
            <label>Input Method:</label>
            <div className="input-method">
              <label>
                <input 
                  type="radio" 
                  name="inputMethod1" 
                  value="voice" 
                  checked={inputMethod1 === 'voice'} 
                  onChange={(e) => setInputMethod1(e.target.value)} 
                /> Voice
              </label>
              <label>
                <input 
                  type="radio" 
                  name="inputMethod1" 
                  value="text" 
                  checked={inputMethod1 === 'text'} 
                  onChange={(e) => setInputMethod1(e.target.value)} 
                /> Text
              </label>
            </div>
          </div>
        </div>

        {/* Person 2 */}
        <div className="participant">
          <h2>Person 2</h2>
          <div className="setup-field">
            <label htmlFor="language2">Language:</label>
            <select 
              id="language2" 
              value={language2} 
              onChange={(e) => setLanguage2(e.target.value)}
            >
              <option value="">Select Language</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              {/* More options can be added */}
            </select>
          </div>
          <div className="setup-field">
            <label>Input Method:</label>
            <div className="input-method">
              <label>
                <input 
                  type="radio" 
                  name="inputMethod2" 
                  value="voice" 
                  checked={inputMethod2 === 'voice'} 
                  onChange={(e) => setInputMethod2(e.target.value)} 
                /> Voice
              </label>
              <label>
                <input 
                  type="radio" 
                  name="inputMethod2" 
                  value="text" 
                  checked={inputMethod2 === 'text'} 
                  onChange={(e) => setInputMethod2(e.target.value)} 
                /> Text
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Translation Interface */}
      <div className="translation-interface">
        {!isTranslating ? (
          <button className="start-btn" onClick={startTranslation}>Start</button>
        ) : (
          <button className="stop-btn" onClick={stopTranslation}>Stop</button>
        )}
        <div className="live-captions">
          {isTranslating ? (
            <p>Listening... (live captions will appear here)</p>
          ) : (
            <p>{liveCaptions}</p>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Do you want to save this conversation?</h3>
            <div className="modal-buttons">
              <button onClick={confirmExit} className="modal-btn download">Download Audio</button>
              <button onClick={cancelExit} className="modal-btn cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationPage;
