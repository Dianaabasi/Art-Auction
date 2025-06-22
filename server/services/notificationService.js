const Notification = require('../models/Notification');
const User = require('../models/User');
const Artwork = require('../models/Artwork');

/**
 * Create a notification when a bid is placed
 */
const notifyBidPlaced = async (artwork, bid, bidder) => {
  try {
    // Notify the artist
    await Notification.create({
      recipient: artwork.artist,
      type: 'bid_placed',
      message: `${bidder.name} placed a bid of $${bid.amount} on your artwork "${artwork.title}"`,
      relatedArtwork: artwork._id,
      relatedBid: bid._id,
      isRead: false
    });
    
    // Notify previous highest bidder if exists
    if (artwork.highestBidder && artwork.highestBidder.toString() !== bidder._id.toString()) {
      await Notification.create({
        recipient: artwork.highestBidder,
        type: 'outbid',
        message: `You've been outbid on "${artwork.title}". The new highest bid is $${bid.amount}`,
        relatedArtwork: artwork._id,
        relatedBid: bid._id,
        isRead: false
      });
    }
    
    // Get all users who have bid on this artwork before
    const previousBidders = await Bid.distinct('bidder', { 
      artwork: artwork._id,
      bidder: { $ne: bidder._id }
    });
    
    // Notify all previous bidders except the current bidder and the previous highest bidder
    for (const previousBidder of previousBidders) {
      if (previousBidder.toString() !== artwork.highestBidder?.toString()) {
        await Notification.create({
          recipient: previousBidder,
          type: 'new_bid',
          message: `A new bid of $${bid.amount} was placed on "${artwork.title}"`,
          relatedArtwork: artwork._id,
          relatedBid: bid._id,
          isRead: false
        });
      }
    }
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
};

/**
 * Create a notification when an auction ends
 */
const notifyAuctionEnded = async (artwork) => {
  try {
    // Notify the artist
    await Notification.create({
      recipient: artwork.artist,
      type: 'auction_ended',
      message: `Your auction for "${artwork.title}" has ended`,
      relatedArtwork: artwork._id,
      isRead: false
    });
    
    // Notify the winner if there is one
    if (artwork.highestBidder) {
      await Notification.create({
        recipient: artwork.highestBidder,
        type: 'auction_won',
        message: `Congratulations! You won the auction for "${artwork.title}" with a bid of $${artwork.currentBid}`,
        relatedArtwork: artwork._id,
        isRead: false
      });
    }
  } catch (error) {
    console.error('Error creating auction end notifications:', error);
  }
};

module.exports = {
  notifyBidPlaced,
  notifyAuctionEnded
};