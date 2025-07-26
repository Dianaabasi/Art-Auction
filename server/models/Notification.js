const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'bid_placed', 
      'outbid', 
      'new_bid', 
      'auction_ended', 
      'auction_won', 
      'payment_received',
      'artwork_approved',
      'artwork_rejected',
      'payment_completed',
      'auction_ending_soon'
    ],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedArtwork: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork'
  },
  relatedBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);