const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Artwork = require('../models/Artwork');

// Get recent artworks
router.get('/recent', async (req, res) => {
  try {
    const recentArtworks = await Artwork.find()
      .populate('artist', 'name')
      .sort({ createdAt: -1 })
      .limit(3);
    res.json(recentArtworks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create artwork with image upload
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image' });
    }

    const imageUrl = `/uploads/artworks/${req.file.filename}`;
    
    const artwork = new Artwork({
      title: req.body.title,
      description: req.body.description,
      startingPrice: req.body.startingPrice,
      imageUrl: imageUrl,
      artist: req.user._id
    });

    await artwork.save();
    res.status(201).json(artwork);
  } catch (error) {
    console.error('Error creating artwork:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const artworks = await Artwork.find()
      .populate('artist', '_id name')
      .sort({ createdAt: -1 });
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id)
      .populate('artist', '_id name');
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add ownership middleware
const checkArtworkOwnership = async (req, res, next) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }
    if (artwork.artist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to modify this artwork' });
    }
    req.artwork = artwork;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update artwork (protected + ownership check)
router.put('/:id', [auth, checkArtworkOwnership], async (req, res) => {
  try {
    const artwork = await Artwork.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(artwork);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete artwork (protected + ownership check)
router.delete('/:id', [auth, checkArtworkOwnership], async (req, res) => {
  try {
    await req.artwork.remove();
    res.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get artworks by artist ID
router.get('/artist/:id', async (req, res) => {
  try {
    const artworks = await Artwork.find({ 
      artist: req.params.id 
    })
    .populate('artist', 'name')
    .sort({ createdAt: -1 })
    .lean();
    
    res.json(artworks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch artist\'s artworks' });
  }
});

// POST /api/artworks/:id/auction - Start an auction
router.post('/:id/auction', auth, async (req, res) => {
  try {
    const { duration } = req.body;
    
    if (!duration || isNaN(duration)) {
      return res.status(400).json({ message: 'Valid duration is required' });
    }
    
    // Find the artwork
    const artwork = await Artwork.findById(req.params.id);
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    // Check if user is the artist
    if (artwork.artist.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the artist can start an auction' });
    }
    
    // Check if artwork can start auction
    if (artwork.status === 'active') {
      return res.status(400).json({ message: 'Artwork is already in an active auction' });
    }
    if (artwork.status !== 'pending' && artwork.status !== 'expired') {
      return res.status(400).json({ message: 'Artwork cannot start auction in current state' });
    }
    
    // Calculate end time based on duration in hours
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + (duration * 60 * 60 * 1000));
    
    // Reset auction details
    artwork.status = 'active';
    artwork.auctionStartTime = startTime;
    artwork.auctionEndTime = endTime;
    artwork.currentBid = artwork.startingPrice;
    artwork.totalBids = 0;
    artwork.highestBidder = null;
    
    await artwork.save();
    
    // Try to emit socket event, but don't let it affect the response
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('auction-started', {
          artworkId: artwork._id,
          title: artwork.title,
          startTime: artwork.auctionStartTime,
          endTime: artwork.auctionEndTime
        });
      }
    } catch (socketError) {
      console.error('Socket event error:', socketError);
      // Continue with the response even if socket event fails
    }
    
    res.json(artwork);
  } catch (error) {
    console.error('Error starting auction:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// POST /api/artworks/:id/end - End an auction
router.post('/:id/end', auth, async (req, res) => {
  try {
    // Find the artwork
    const artwork = await Artwork.findById(req.params.id)
      .populate('artist', 'name');
    
    if (!artwork) {
      return res.status(404).json({ message: 'Artwork not found' });
    }
    
    // Check if user is the artist
    if (artwork.artist._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the artist can end the auction' });
    }
    
    // Check if artwork is in active auction
    if (artwork.status !== 'active') {
      return res.status(400).json({ message: 'Artwork is not in an active auction' });
    }
    
    // End the auction with appropriate status
    artwork.status = artwork.totalBids > 0 ? 'sold' : 'expired';
    artwork.auctionEndTime = new Date();
    
    await artwork.save();
    
    // Try to emit socket event, but don't let it affect the response
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('auction-ended', {
          artworkId: artwork._id,
          title: artwork.title,
          status: artwork.status,
          endTime: artwork.auctionEndTime,
          finalBid: artwork.currentBid,
          hasBids: artwork.totalBids > 0
        });
      }
    } catch (socketError) {
      console.error('Socket event error:', socketError);
      // Continue with the response even if socket event fails
    }
    
    res.json(artwork);
  } catch (error) {
    console.error('Error ending auction:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

module.exports = router;