const express = require('express');
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/auth/users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
