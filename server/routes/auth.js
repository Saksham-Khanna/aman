const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please provide name, email, and password' });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // First user ever registered becomes the Admin (Head of Team)
    // All subsequent users are Members — only an Admin can promote via Admin Portal
    const userCount = await User.countDocuments();
    const finalRole = userCount === 0 ? 'Admin' : 'Member';
    
    user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role: finalRole
    });

    const payload = { user: { id: user._id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 36000 }, (err, token) => {
      if (err) throw err;
      res.json({ 
        token, 
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        } 
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user._id, role: user.role } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 36000 }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email, avatar: user.avatar } });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await User.findOneAndUpdate({ _id: req.user.id }, { $set: { name, email } }, { new: true });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update Password
router.put('/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
