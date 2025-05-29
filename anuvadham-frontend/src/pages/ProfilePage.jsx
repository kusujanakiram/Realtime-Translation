import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import Header from '../components/Header';
import { FaEdit, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';

const ProfilePage = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [user, setUser] = useState({ name: '', email: '' });
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = '/';
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { name, email, profilePic } = res.data;
        setUser({ name, email });

        if (profilePic) {
          // Do NOT prepend API_BASE_URL if it's already a full URL (Cloudinary)
          setProfilePic(`${profilePic.trim()}?t=${Date.now()}`);
        }
      } catch (error) {
        console.error('Failed to load user info:', error);
      }
    };

    fetchUser();
  }, []);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);
    formData.append('userId', localStorage.getItem('userId'));

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/auth/upload-profile-pic`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      // Directly use Cloudinary URL returned from backend
      setProfilePic(`${res.data.profilePic}?t=${Date.now()}`);
    } catch (err) {
      console.error('Error uploading profile picture:', err);
    }
  };

  const handleChangePassword = () => {
    alert('Change password functionality goes here.');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  return (
    <div className="profile-page">
      <Header />
      <div className="profile-content-wrapper">
      <div className="profile-container">
        <h2>Profile</h2>
        <div className="profile-section">
          <div className="profile-pic">
            <div className="image-wrapper">
              {profilePic ? (
                <img src={profilePic} alt="Profile" />
              ) : (
                <FaUserCircle size={130} color="#ccc" />
              )}

              <label htmlFor="file-upload" className="edit-icon">
                <FaEdit />
              </label>

              <input
                id="file-upload"
                type="file"
                onChange={handleProfilePicChange}
                accept="image/*"
              />
            </div>
          </div>

          <div className="user-info">
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </div>
        </div>

        <div className="account-management">
          <button onClick={handleChangePassword} className="change-password-btn">
            Change Password
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default ProfilePage;
