const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/uploadMiddleware');
const path = require('path');
const fs = require('fs');
const protect = require('../middleware/auth');

// 🔐 Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Create a new user with the password
    const user = await User.create({ name, email, password });

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Respond with the token and user info
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
});

// 🔐 Login
router.post('/login', async (req, res) => {
  console.log("📩 Login request received:", req.body);
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ User not found for email:", email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('✅ Found user:', user.email);
    console.log('🔐 Provided password:', password);

    // Use the matchPassword method defined in the model
    const isMatch = await user.matchPassword(password);
    console.log('🔍 Password match result:', isMatch);

    if (!isMatch) {
      console.log("❌ Passwords don't match");
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log("✅ Login successful, sending token");
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });

  } catch (error) {
    console.error("🔥 Login error:", error);
    res.status(500).json({ message: 'Login failed', error });
  }
});

router.post('/upload-profile-pic', protect, upload.single('profilePic'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const profilePicPath = `/uploads/profilePics/${req.file.filename}`;

    // Delete old profile pic
    if (user.profilePic && user.profilePic.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', user.profilePic);
      fs.unlink(oldPath, (err) => {
        if (err) console.log('Failed to delete old pic:', err);
      });
    }

    user.profilePic = profilePicPath;
    await user.save();

    res.status(200).json({ message: 'Profile picture updated', profilePic: profilePicPath });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload', error });
  }
});

router.put('/change-password',protect, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) return res.status(400).json({ message: 'New password is required' });

  const user = await User.findById(req.user._id);
  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic || null,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user details', error });
  }
});

module.exports = router;
