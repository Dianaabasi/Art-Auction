const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all artists
router.get('/artists', async (req, res) => {
  try {
    const artists = await User.find({ role: 'artist' })
      .select('_id name profilePhoto')
      .lean();
    
    res.json(artists);
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({ error: 'Failed to fetch artists' });
  }
});

// Get artist by ID
router.get('/artists/:id', async (req, res) => {
  try {
    const artist = await User.findOne({ 
      _id: req.params.id,
      role: 'artist'
    })
    .select('_id name bio profilePhoto')
    .lean();

    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    
    res.json(artist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artist details' });
  }
});

module.exports = router;