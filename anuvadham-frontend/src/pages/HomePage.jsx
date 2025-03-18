import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  // Sample recent translations (replace with dynamic data later)
  const recentTranslations = [
    { id: 1, source: "Hello", target: "Hola", timestamp: "2 mins ago" },
    { id: 2, source: "How are you?", target: "¿Cómo estás?", timestamp: "10 mins ago" },
    { id: 3, source: "Goodbye", target: "Adiós", timestamp: "30 mins ago" },
  ];

  return (
    <div className="home-container">
      {/* Sticky Header */}
      <header className="header">
        <div className="logo">
          <img src="/path-to-logo.png" alt="Logo" />
          <span className="web-name">Anuvadham</span>
        </div>
        <nav className="nav-links">
          <a href="/translate">Translate</a>
          <a href="/history">History</a>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
          <div className="profile-section">
            <img
              src="/path-to-profile.png"
              alt="Profile"
              className="profile-icon"
            />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Conversation Box */}
        <div className="feature-box" onClick={() => navigate("/translateform")}>
          <span className="feature-text">
            Start Conversation
          </span>
        </div>

        {/* Recent Translations */}
        <section className="recent-translations">
          <h2>Recent Translations</h2>
          <div className="translation-cards">
            {recentTranslations.map((item) => (
              <div key={item.id} className="translation-card">
                <div className="translation-text">
                  <span className="source">{item.source}</span>
                  <span className="arrow">→</span>
                  <span className="target">{item.target}</span>
                </div>
                <span className="timestamp">{item.timestamp}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <a href="/privacy">Privacy Policy</a>
        <a href="/support">Support</a>
      </footer>
    </div>
  );
};

export default HomePage;
