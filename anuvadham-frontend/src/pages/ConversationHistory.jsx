import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { FaComments } from "react-icons/fa";
import axios from 'axios';
import './ConversationHistory.css';
import languageMap from '../languageNameMap'; 
import Header from '../components/Header'; 

const ConversationHistory = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterSourceLang, setFilterSourceLang] = useState('');
  const [filterTargetLang, setFilterTargetLang] = useState('');
  const [languages, setLanguages] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Redirect if no token
  useEffect(() => {
    if (!token) navigate('/');
  }, [token, navigate]);

  // Populate languages from languageMap
  useEffect(() => {
    const formattedLanguages = Array.from(languageMap.entries()).map(([code, name]) => ({
      value: code,
      label: name
    }));
    setLanguages(formattedLanguages);
  }, []);

  // Fetch conversation history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch conversation history:', err);
      }
    };
    fetchHistory();
  }, [token]);

  const getRelativeTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const secondsDiff = Math.floor((now - past) / 1000);

    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(secondsDiff / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  };

  const filteredHistory = history.filter(item => {
  const term = searchTerm.trim().toLowerCase();

  const matchesSearch = !term || (
    (item.conversationText?.toLowerCase().includes(term)) ||
    (item.purpose?.toLowerCase().includes(term))
  );

  const matchesDate = filterDate
    ? new Date(item.startTime).toISOString().startsWith(filterDate)
    : true;

 const selectedSourceLangName = languageMap.get(filterSourceLang)?.toLowerCase();
const selectedTargetLangName = languageMap.get(filterTargetLang)?.toLowerCase();

const matchesSourceLang = filterSourceLang
  ? item.person1?.language?.trim().toLowerCase() === selectedSourceLangName
  : true;

const matchesTargetLang = filterTargetLang
  ? item.person2?.language?.trim().toLowerCase() === selectedTargetLangName
  : true;


  return matchesSearch && matchesDate && matchesSourceLang && matchesTargetLang;

});


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        alert('✅ Conversation deleted successfully!');
        setHistory(prev => prev.filter(item => item._id !== id));
      }
    } catch (err) {
      console.error('❌ Failed to delete conversation:', err);
      alert('Error deleting conversation. Please try again.');
    }
  };

  const handleExport = async (item) => {
    try {
      const textContent = `
        Conversation Name: ${item.conversationName}
        Purpose: ${item.purpose}
        Language Pair: ${item.person1?.language} ➡️ ${item.person2?.language}
        Date: ${new Date(item.startTime).toLocaleString()}

        Conversation:
        ${item.conversationText}
      `.trim();

      const textBlob = new Blob([textContent], { type: 'text/plain' });
      const textUrl = URL.createObjectURL(textBlob);
      const textLink = document.createElement('a');
      textLink.href = textUrl;
      textLink.download = `${item.conversationName || 'conversation'}.txt`;
      textLink.click();
      URL.revokeObjectURL(textUrl);

      if (item.conversationAudio) {
        let audioUrl = item.conversationAudio;
        if (!audioUrl.startsWith('http://') && !audioUrl.startsWith('https://')) {
          audioUrl = `${API_BASE_URL}${audioUrl}`;
        }

        const audioResponse = await fetch(audioUrl);
        const audioBlob = await audioResponse.blob();
        const audioObjectUrl = URL.createObjectURL(audioBlob);
        const audioLink = document.createElement('a');
        audioLink.href = audioObjectUrl;
        audioLink.download = `${item.conversationName || 'conversation'}.wav`;
        audioLink.click();
        URL.revokeObjectURL(audioObjectUrl);
      } else {
        alert('No audio file available for this conversation.');
      }
    } catch (error) {
      console.error('❌ Failed to export:', error);
      alert('Error exporting conversation.');
    }
  };

  const handlePlayAudio = (audioUrl) => {
    if (!audioUrl) return alert('No audio file available for this conversation.');

    const fullAudioUrl = audioUrl.startsWith('http://') || audioUrl.startsWith('https://')
      ? audioUrl
      : `${API_BASE_URL}${audioUrl}`;

    new Audio(fullAudioUrl).play().catch((err) => {
      console.error('❌ Failed to play audio:', err);
      alert('Error playing audio file.');
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDate('');
    setFilterSourceLang('');
    setFilterTargetLang('');
  };

  return (
    <div className="conversation-history-page">
      <Header className="header-container"/>
      <div className="history-container hide-scrollbar ">
        <h2>Conversation History</h2>

        <div className="filter-section">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <Select
            options={languages}
            value={languages.find(lang => lang.value === filterSourceLang)}
            onChange={(selected) => setFilterSourceLang(selected?.value || '')}
            placeholder="Source Language"
            isClearable
            isSearchable
          />
          <Select
            options={languages}
            value={languages.find(lang => lang.value === filterTargetLang)}
            onChange={(selected) => setFilterTargetLang(selected?.value || '')}
            placeholder="Target Language"
            isClearable
            isSearchable
          />
          <button onClick={clearFilters}>Clear</button>
        </div>

        <div className="history-list">
          {filteredHistory.length ? (
            filteredHistory.map((item) => (
              <div key={item._id} className="history-card">
                <div className="card-content">
                  <div className="card-header">
                    <h2 className="conversation-name">{item.conversationName}</h2>
                    <small className="timestamp">{getRelativeTime(item.startTime)}</small>
                  </div>
                  <h3>{item.purpose}</h3>
                  <p>{item.person1?.language} ➡️ {item.person2?.language}</p>
                  <p>{item.conversationText?.slice(0, 100)}...</p>
                </div>
                <div className="card-actions">
                  {item.conversationAudio && (
                    <button onClick={() => handlePlayAudio(item.conversationAudio)} title="Play Audio">🔊</button>
                  )}
                  <button onClick={() => handleExport(item)} title="Export">📤</button>
                  <button onClick={() => handleDelete(item._id)} title="Delete">🗑️</button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <FaComments className="empty-icon" />
              <h3>No Conversations Yet!</h3>
              <p>Start a conversation to see it here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationHistory;
