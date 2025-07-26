const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const Bid = require('../models/Bid');
const Artwork = require('../models/Artwork');
const adminAuth = require('../middleware/admin');

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

// Get all bids placed by the authenticated user
router.get('/bids', auth, async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'artwork',
        select: 'title _id imageUrl status currentBid auctionEndTime winner startingPrice artist',
        populate: [
          { path: 'winner', select: '_id name email' },
          { path: 'artist', select: '_id name' }
        ]
      });
    
    // For each bid, check if payment is completed for this user and artwork
    const Payment = require('../models/Payment');
    const bidsWithPayment = await Promise.all(bids.map(async (bid) => {
      const payment = await Payment.findOne({ user: req.user._id, artwork: bid.artwork._id, status: 'completed' });
      
      // Check if this user is the winner of this artwork
      const isWinner = bid.artwork.winner && bid.artwork.winner._id.toString() === req.user._id.toString();
      
      return {
        ...bid.toObject(),
        paymentCompleted: !!payment,
        isWinner: isWinner
      };
    }));
    res.json(bidsWithPayment);
  } catch (error) {
    console.error('Error fetching user bids:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only, with optional search/filter)
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role (admin only)
router.put('/:id/role', [auth, adminAuth], async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ban/unban user (admin only)
router.put('/:id/ban', [auth, adminAuth], async (req, res) => {
  try {
    const { banned } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { banned }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;