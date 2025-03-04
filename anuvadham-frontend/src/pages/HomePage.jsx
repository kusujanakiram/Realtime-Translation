
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      <header className="header">
        <div className="logo">
          <img src="/path-to-logo.png" alt="Logo" />
          <span className="web-name">RealTime Translator</span>
        </div>
        <nav className="nav-links">
          <a href="/translate">Translate</a>
          <a href="/history">History</a>
          <a href="/profile">Profile</a>
        </nav>
      </header>
      <main className="main-content">
        <div className="feature-box">
          <button onClick={() => navigate('/translate')} className="conversation-btn">
            Start Conversation
          </button>
        </div>
        <div className="recent-translations">
          <h2>Recent Translations</h2>
          {/* Translation cards go here */}
        </div>
      </main>
      <footer className="footer">
        <a href="/privacy">Privacy Policy</a>
        <a href="/support">Support</a>
      </footer>
    </div>
  );
};

export default HomePage;
