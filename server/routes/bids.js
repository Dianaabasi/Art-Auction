const express = require('express');
const router = express.Router();
const Bid = require('../models/Bid');
const Artwork = require('../models/Artwork');
const auth = require('../middleware/auth');
const { notifyBidPlaced } = require('../services/notificationService');

// GET /api/bids/artwork/:id - Get bids for an artwork
router.get('/artwork/:id', async (req, res) => {
  try {
    const bids = await Bid.find({ artwork: req.params.id })
      .sort({ createdAt: -1 })
      .populate('bidder', 'name email profilePhoto')
      .limit(20);
    
    res.json(bids);
  } catch (error) {
    console.error('Error fetching bids:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/bids/:artworkId - Place a bid
router.post('/:artworkId', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const artworkId = req.params.artworkId;
    
    // Validate bid amount
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: 'Valid bid amount is required' });
    }
    
    // Find the artwork
    const artwork = await Artwork.findById(artworkId);
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    // Check if auction is active
    if (artwork.status !== 'active') {
      return res.status(400).json({ message: 'This artwork is not in an active auction' });
    }
    
    // Check if auction has ended
    const now = new Date();
    if (now > new Date(artwork.auctionEndTime)) {
      return res.status(400).json({ message: 'Auction has ended' });
    }
    
    // Check if bid is higher than current price
    if (amount <= artwork.currentBid) {
      return res.status(400).json({ 
        message: `Bid must be higher than current bid of $${artwork.currentBid}` 
      });
    }
    
    // Check if user is not the artist
    if (req.user.id === artwork.artist.toString()) {
      return res.status(400).json({ message: 'You cannot bid on your own artwork' });
    }
    
    // Create new bid
    const newBid = new Bid({
      amount,
      artwork: artworkId,
      bidder: req.user.id,
      status: 'active'
    });
    
    await newBid.save();
    
    // Update artwork with new bid
    artwork.currentBid = amount;
    artwork.totalBids = (artwork.totalBids || 0) + 1;
    artwork.highestBidder = req.user.id;
    await artwork.save();
    
    // Notify users about the new bid
    await notifyBidPlaced(artwork, newBid, req.user);
    
    // Emit socket event for real-time updates
    req.app.get('io').to(`auction:${artworkId}`).emit('bid-placed', {
      artworkId,
      amount,
      bidder: {
        id: req.user.id,
        name: req.user.name
      },
      timestamp: new Date()
    });
    
    res.status(201).json({ 
      message: 'Bid placed successfully',
      bid: newBid,
      currentBid: amount
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;