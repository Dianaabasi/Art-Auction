const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const artworksDir = path.join(uploadsDir, 'artworks');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(artworksDir)) {
  fs.mkdirSync(artworksDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/artworks', require('./routes/artworks'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/users', require('./routes/users'));
app.use('/api/payments', require('./routes/payments'));

// WebSocket setup
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store io instance for use in routes
app.set('io', io);

// Socket connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('join-room', (room) => {
    socket.join(room);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Scheduled task to automatically end expired auctions
const autoEndExpiredAuctions = async () => {
  try {
    const Artwork = require('./models/Artwork');
    const Bid = require('./models/Bid');
    
    const now = new Date();
    const expiredAuctions = await Artwork.find({
      status: 'active',
      auctionEndTime: { $lt: now }
    });
    
    for (const artwork of expiredAuctions) {
      // Find the highest bid for this artwork
      const highestBid = await Bid.findOne({ artwork: artwork._id }).sort({ amount: -1 });
      
      if (highestBid) {
        // There are bids, assign winner
        artwork.status = 'sold';
        artwork.winner = highestBid.bidder;
        artwork.currentBid = highestBid.amount;
      } else {
        // No bids, mark as expired
        artwork.status = 'expired';
        artwork.winner = null;
      }
      
      await artwork.save();
      
      // Emit socket event for real-time updates
      io.emit('auction-ended', {
        artworkId: artwork._id,
        title: artwork.title,
        status: artwork.status,
        endTime: artwork.auctionEndTime,
        finalBid: artwork.currentBid,
        hasBids: !!highestBid
      });
      
      console.log(`Auto-ended auction: ${artwork.title} - Status: ${artwork.status}`);
    }
  } catch (error) {
    console.error('Error in auto-ending expired auctions:', error);
  }
};

// Run the task every minute
setInterval(autoEndExpiredAuctions, 60000);

// Also run it once on server start
autoEndExpiredAuctions();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});