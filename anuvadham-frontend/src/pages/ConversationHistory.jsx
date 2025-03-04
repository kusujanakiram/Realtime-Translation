import React, { useState } from 'react';
import './ConversationHistory.css';

const ConversationHistory = () => {
  // Dummy data representing past translations
  const [history, setHistory] = useState([
    {
      id: 1,
      sourceText: 'Hello, how are you?',
      sourceLang: 'English',
      translatedText: 'Hola, ¿cómo estás?',
      targetLang: 'Spanish',
      timestamp: '2023-03-01 10:00',
      audioUrl: 'audio1.mp3'
    },
    {
      id: 2,
      sourceText: 'Good Morning',
      sourceLang: 'English',
      translatedText: 'Buenos días',
      targetLang: 'Spanish',
      timestamp: '2023-03-02 08:30',
      audioUrl: ''
    },
    // Additional dummy data can be added here
  ]);

  // Filter state values
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterSourceLang, setFilterSourceLang] = useState('');
  const [filterTargetLang, setFilterTargetLang] = useState('');

  // Filter the history data based on search and selected filters
  const filteredHistory = history.filter(item => {
    const matchesSearch =
      item.sourceText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.translatedText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? item.timestamp.includes(filterDate) : true;
    const matchesSourceLang = filterSourceLang ? item.sourceLang === filterSourceLang : true;
    const matchesTargetLang = filterTargetLang ? item.targetLang === filterTargetLang : true;
    return matchesSearch && matchesDate && matchesSourceLang && matchesTargetLang;
  });

  // Delete a translation after confirmation
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this translation?')) {
      setHistory(history.filter(item => item.id !== id));
    }
  };

  // Dummy export function: shows an alert with translation details
  const handleExport = (item) => {
    alert(`Exporting Translation:\nSource: ${item.sourceText}\nTranslated: ${item.translatedText}`);
  };

  // Dummy audio playback function
  const handlePlayAudio = (audioUrl) => {
    if (audioUrl) {
      alert(`Playing audio: ${audioUrl}`);
    }
  };

  return (
    <div className="history-container">
      <h2>Conversation History</h2>
      <div className="filter-section">
        <input 
          type="text" 
          placeholder="Search translations..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input 
          type="date" 
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <select 
          value={filterSourceLang}
          onChange={(e) => setFilterSourceLang(e.target.value)}
        >
          <option value="">Source Language</option>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
        </select>
        <select 
          value={filterTargetLang}
          onChange={(e) => setFilterTargetLang(e.target.value)}
        >
          <option value="">Target Language</option>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
        </select>
      </div>
      <div className="history-list">
        {filteredHistory.length > 0 ? (
          filteredHistory.map(item => (
            <div key={item.id} className="history-card">
              <div className="card-content">
                <div>
                  <strong>Source ({item.sourceLang}):</strong>
                  <p>{item.sourceText}</p>
                </div>
                <div>
                  <strong>Translated ({item.targetLang}):</strong>
                  <p>{item.translatedText}</p>
                </div>
                <div>
                  <small>{item.timestamp}</small>
                </div>
              </div>
              <div className="card-actions">
                {item.audioUrl && (
                  <button onClick={() => handlePlayAudio(item.audioUrl)} title="Play Audio">
                    🔊
                  </button>
                )}
                <button onClick={() => handleExport(item)} title="Export Translation">
                  📤
                </button>
                <button onClick={() => handleDelete(item.id)} title="Delete Translation">
                  🗑️
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No translations found.</p>
        )}
      </div>
    </div>
  );
};

export default ConversationHistory;
