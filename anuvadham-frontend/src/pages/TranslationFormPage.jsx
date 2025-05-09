import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';
import './TranslationFormPage.css';

const TranslationFormPage = () => {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState('');
  const [conversationName, setConversationName] = useState('');
  const [language1, setLanguage1] = useState(null);
  const [language2, setLanguage2] = useState(null);
  const [inputMethod1, setInputMethod1] = useState('text');
  const [inputMethod2, setInputMethod2] = useState('text');
  const [languages, setLanguages] = useState([]);

  const api_key = import.meta.env.VITE_RAPIDAPI_KEY;
  useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) navigate('/');
    }, []);
    
  useEffect(() => {
    const fetchLanguages = async () => {
      if (!api_key) {
        console.error('API Key is missing!');
        return;
      }
      try {
        console.log('Fetching languages...');
        const response = await axios.get('https://ai-translate.p.rapidapi.com/languages', {
          headers: {
            'x-rapidapi-key': api_key,
            'x-rapidapi-host': 'ai-translate.p.rapidapi.com',
          },
        });
        const formattedLanguages = Object.entries(response.data).map(([code, name]) => ({
          value: code,
          label: name,
        }));
        setLanguages(formattedLanguages);
      } catch (error) {
        console.error('Error fetching languages:', error?.response?.status, error?.message);
      }
    };
    fetchLanguages();
  }, [api_key]);

  const handleStartTranslation = () => {
    if (!purpose || !conversationName || !language1 || !language2) {
      alert('Please fill all required fields.');
      return;
    }

    const formData = { 
      purpose, 
      conversationName, 
      language1: language1.value, 
      language2: language2.value, 
      inputMethod1, 
      inputMethod2 
    };

    localStorage.setItem('translationSettings', JSON.stringify(formData));
    navigate('/translate');
  };

  return (
    <div className="translation-form-page">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <img src="images\AnuvadhamLogo.png" alt="Logo" />
          <span>Anuvadham</span>
        </div></header>

      {/* MAIN FORM CONTENT */}
      <main className="translation-form-container">
        <div className="form-card">
          <h1 className="form-title">Setup Your Translation</h1>
          <div className="form-group">
            <label>Conversation Name</label>
            <input
              type="text"
              value={conversationName}
              onChange={(e) => setConversationName(e.target.value)}
              placeholder="Enter conversation name"
            />
          </div>
          <div className="form-group">
            <label>Purpose</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Business, Travel"
            />
          </div>

          <div className="language-section">
            <div className="language-group">
              <h2>Person 1</h2>
              <Select
                options={languages}
                value={language1}
                onChange={setLanguage1}
                placeholder="Select Language"
                isSearchable
              />
              <div className="input-method">
                <label>
                  <input
                    type="radio"
                    value="voice"
                    checked={inputMethod1 === 'voice'}
                    onChange={() => setInputMethod1('voice')}
                  /> Voice
                </label>
                <label>
                  <input
                    type="radio"
                    value="text"
                    checked={inputMethod1 === 'text'}
                    onChange={() => setInputMethod1('text')}
                  /> Text
                </label>
              </div>
            </div>

            <div className="language-group">
              <h2>Person 2</h2>
              <Select
                options={languages}
                value={language2}
                onChange={setLanguage2}
                placeholder="Select Language"
                isSearchable
              />
              <div className="input-method">
                <label>
                  <input
                    type="radio"
                    value="voice"
                    checked={inputMethod2 === 'voice'}
                    onChange={() => setInputMethod2('voice')}
                  /> Voice
                </label>
                <label>
                  <input
                    type="radio"
                    value="text"
                    checked={inputMethod2 === 'text'}
                    onChange={() => setInputMethod2('text')}
                  /> Text
                </label>
              </div>
            </div>
          </div>

          <button className="start-button" onClick={handleStartTranslation}>
            Start Translation
          </button>
        </div>
      </main>

     
    </div>
  );
};

export default TranslationFormPage;