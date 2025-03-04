import React, { useState } from 'react';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [defaultSourceLang, setDefaultSourceLang] = useState('English');
  const [defaultTargetLang, setDefaultTargetLang] = useState('Spanish');
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState(16);

  // Dummy user information
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com'
  };

  // Update profile picture from file input
  const handleProfilePicChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleChangePassword = () => {
    alert('Change password functionality goes here.');
  };

  const handleLogout = () => {
    alert('Logging out...');
    // Implement logout and redirection logic here
  };

  return (
    <div className="profile-container" style={{ fontSize: `${fontSize}px` }}>
      <h2>Profile</h2>
      <div className="profile-section">
        <div className="profile-pic">
          <img src={profilePic || '/default-avatar.png'} alt="Profile" />
          <input type="file" onChange={handleProfilePicChange} />
        </div>
        <div className="user-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      </div>
      <div className="preferences-section">
        <h3>Preferences</h3>
        <div className="preference-field">
          <label htmlFor="defaultSourceLang">Default Source Language:</label>
          <select 
            id="defaultSourceLang" 
            value={defaultSourceLang} 
            onChange={(e) => setDefaultSourceLang(e.target.value)}
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
        </div>
        <div className="preference-field">
          <label htmlFor="defaultTargetLang">Default Target Language:</label>
          <select 
            id="defaultTargetLang" 
            value={defaultTargetLang} 
            onChange={(e) => setDefaultTargetLang(e.target.value)}
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
        </div>
        <div className="preference-field">
          <label>Theme:</label>
          <div className="theme-toggle">
            <label>
              <input 
                type="radio" 
                name="theme" 
                value="light" 
                checked={theme === 'light'} 
                onChange={() => setTheme('light')}
              /> Light
            </label>
            <label>
              <input 
                type="radio" 
                name="theme" 
                value="dark" 
                checked={theme === 'dark'} 
                onChange={() => setTheme('dark')}
              /> Dark
            </label>
          </div>
        </div>
        <div className="preference-field">
          <label htmlFor="fontSize">Font Size:</label>
          <input 
            type="range" 
            id="fontSize" 
            min="12" 
            max="24" 
            value={fontSize} 
            onChange={(e) => setFontSize(e.target.value)}
          />
        </div>
      </div>
      <div className="account-management">
        <button onClick={handleChangePassword} className="change-password-btn">Change Password</button>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default ProfilePage;
