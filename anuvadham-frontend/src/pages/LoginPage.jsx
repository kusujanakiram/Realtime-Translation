import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();  // Use useNavigate instead of useHistory
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const isValid = email && password; // Basic validation

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🚀 Submitting login form", email, password);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Login successful!");
      navigate('/home'); 
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong. Please try again.");
    }
  };
  

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            value={email} 
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div className="form-field">
          <label htmlFor="password">Password</label>
          <div className="password-input">
            <input 
              type={showPassword ? 'text' : 'password'} 
              id="password" 
              value={password} 
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button 
              type="button" 
              className="toggle-password" 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <button type="submit" className="login-btn" disabled={!isValid}>
          Login
        </button>
      </form>
      <button className="google-btn" >
        Login with Google
      </button>
      <div className="additional-links">
        <a href="/register">Register</a>
        <a href="/forgot-password">Forgot Password?</a>
      </div>
    </div>
  );
};

export default LoginPage;
