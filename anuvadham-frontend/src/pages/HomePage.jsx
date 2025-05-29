import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { FaComments } from "react-icons/fa";

import axios from "axios";
import "./HomePage.css";

const HomePage = () => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [recentTranslations, setRecentTranslations] = useState([]);

   useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) navigate('/');
    }, []);
  
  useEffect(() => {
    const fetchRecentConversations = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/conversations`,{ headers: {
          Authorization: `Bearer ${token}`
        }});
        const sorted = res.data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        setRecentTranslations(sorted.slice(0, 3));
      } catch (err) {
        console.error("Error fetching recent conversations:", err);
      }
    };

    fetchRecentConversations();
  }, []);

  const getRelativeTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const secondsDiff = Math.floor((now - past) / 1000);

    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(secondsDiff / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
      }
    }
    return "just now";
  };

  return (
    <div className="home-container">
      <Header />
      <main className="main-content">
        <div className="feature-box" onClick={() => navigate("/translateform")}>
          <span className="feature-text">Start Conversation</span>
        </div>
        <section className="recent-translations">
          <h2>Recent Translations</h2>
          <div className="translation-cards">
            {recentTranslations.length ? (
              recentTranslations.map((item) => (
                <div key={item._id} className="translation-card">
                  <h4 className="conversation-name">{item.conversationName || "Untitled"}</h4>
                  <div className="translation-meta">
                    <span>{item.person1?.language}</span>
                    <span>⇌</span>
                    <span>{item.person2?.language}</span>
                  </div>
                  <p className="timestamp">{getRelativeTime(item.startTime)}</p>
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
        </section>
      </main>

      <footer className="footer">
        <a href="/privacy">Privacy Policy</a>
        <a href="/support">Support</a>
      </footer>
    </div>
  );
};

export default HomePage;
