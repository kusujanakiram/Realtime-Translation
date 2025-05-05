import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { FaComments } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ConversationHistory.css';

const ConversationHistory = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterSourceLang, setFilterSourceLang] = useState('');
  const [filterTargetLang, setFilterTargetLang] = useState('');
  const api_key = import.meta.env.VITE_RAPIDAPI_KEY;
  const [languages, setLanguages] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

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
  

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/conversations', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setHistory(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch conversation history:', err);
      }
    };

    fetchHistory();
  }, []);

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
    const matchesSearch =
      item.conversationText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.purpose?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = filterDate ? new Date(item.startTime).toISOString().startsWith(filterDate) : true;
    const matchesSourceLang = filterSourceLang ? item.person1?.language === filterSourceLang : true;
    const matchesTargetLang = filterTargetLang ? item.person2?.language === filterTargetLang : true;

    return matchesSearch && matchesDate && matchesSourceLang && matchesTargetLang;
  });

  const sortedHistory = [...filteredHistory].sort(
    (a, b) => new Date(b.startTime) - new Date(a.startTime)
  );

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await axios.delete(`http://localhost:3000/api/conversations/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
         alert('Conversation deleted successfully!');        
        setHistory(prev => prev.filter(item => item._id !== id));
      } catch (err) {
        console.error('❌ Failed to delete conversation:', err);
        alert('Error deleting conversation.');
      }
    }
  };

  const handleExport = async (item) => {
    try {
      // Export conversation text as .txt
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
      
      // Export conversation audio (if available)
      if (item.conversationAudio) {
        const audioResponse = await fetch(`http://localhost:3000${item.conversationAudio}`);
        const audioBlob = await audioResponse.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioLink = document.createElement('a');
        audioLink.href = audioUrl;
        audioLink.download = `${item.conversationName || 'conversation'}.wav`;
        audioLink.click();
        URL.revokeObjectURL(audioUrl);
      } else {
        alert('No audio file available for this conversation.');
      }
    } catch (error) {
      console.error('❌ Failed to export:', error);
      alert('Error exporting conversation.');
    }
  };
  

  const handlePlayAudio = (audioUrl) => {
    if (audioUrl) {
      new Audio(`http://localhost:3000${audioUrl}`).play();
    } else {
      alert('No audio file available for this conversation.');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDate('');
    setFilterSourceLang('');
    setFilterTargetLang('');
  };

  return (
    <div className="conversation-history-page">
         <div className="history-container">
          <h2>Conversation History</h2>

      <div className="filter-section">
        <input type="text" placeholder="Search conversations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
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
        {sortedHistory.length ? (
          sortedHistory.map((item) => (
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
                  <button onClick={() => handlePlayAudio(item.conversationAudio)} title="Play Audio" aria-label="Play Audio">🔊</button>
                )}
                <button onClick={() => handleExport(item)} title="Export Translation" aria-label="Export">📤</button>
                <button onClick={() => handleDelete(item._id)} title="Delete Translation" aria-label="Delete">🗑️</button>
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
