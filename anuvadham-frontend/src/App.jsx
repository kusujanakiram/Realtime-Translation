// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TranslationFormPage from './pages/TranslationFormPage';
import TranslationPage from './pages/TranslationPage';
import ConversationHistory from './pages/ConversationHistory';
import ProfilePage from './pages/ProfilePage';



const NotFoundPage = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>404 - Page Not Found</h2>
    <p>Sorry, we couldn't find what you were looking for.</p>
  </div>
);


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/translateform" element={<TranslationFormPage />} />
      <Route path="/translate" element={<TranslationPage />} />
      <Route path="/history" element={<ConversationHistory />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>

  );
};  


export default App;
