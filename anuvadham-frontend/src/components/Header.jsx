// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => (
  <header className="header">
    <div className="logo">
      <img src="/path-to-logo.png" alt="Logo" />
      <span className="web-name">RealTime Translator</span>
    </div>
    <nav className="nav-links">
      <Link to="/translate">Translate</Link>
      <Link to="/history">History</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  </header>
);

export default Header;
