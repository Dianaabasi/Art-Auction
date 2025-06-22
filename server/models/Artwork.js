const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  startingPrice: {
    type: Number,
    required: true
  },
  currentBid: {
    type: Number,
    default: null
  },
  totalBids: {
    type: Number,
    default: 0
  },
  auctionStartTime: {
    type: Date,
    default: null
  },
  auctionEndTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'sold', 'expired'],
    default: 'pending'
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bids: [{
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

// Add index for better query performance
artworkSchema.index({ status: 1, auctionEndTime: 1 });
artworkSchema.index({ artist: 1 });

module.exports = mongoose.model('Artwork', artworkSchema);