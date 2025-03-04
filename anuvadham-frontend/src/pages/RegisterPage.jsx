import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // All fields must be filled and passwords must match
  const isValid = name && email && password && confirmPassword && (password === confirmPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    // Implement registration logic here
    // On successful registration, redirect to login page
    navigate('/login');
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input 
            type="text" 
            id="name" 
            value={name} 
            placeholder="Enter your name" 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
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
          <input 
            type="password" 
            id="password" 
            value={password} 
            placeholder="Enter your password" 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <div className="form-field">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            value={confirmPassword} 
            placeholder="Confirm your password" 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="register-btn" disabled={!isValid}>
          Register
        </button>
      </form>
      <div className="additional-links">
        <a href="/login">Already registered? Login</a>
      </div>
    </div>
  );
};

export default RegisterPage;
