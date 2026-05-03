const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// Get all users (Admin only)
router.get('/', auth, roleCheck(['Admin']), async (req, res) => {
  try {
    const users = await User.find().select('name email _id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;