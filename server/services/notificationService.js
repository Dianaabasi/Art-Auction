const Notification = require('../models/Notification');
const User = require('../models/User');
const Artwork = require('../models/Artwork');
const Bid = require('../models/Bid');

/**
 * Send real-time notification via websocket
 */
const sendRealtimeNotification = (io, userId, notification) => {
  try {
    io.to(`user:${userId}`).emit('notification', {
      id: notification._id,
      type: notification.type,
      message: notification.message,
      relatedArtwork: notification.relatedArtwork,
      relatedBid: notification.relatedBid,
      isRead: notification.isRead,
      createdAt: notification.createdAt
    });
  } catch (error) {
    console.error('Error sending real-time notification:', error);
  }
};

/**
 * Create a notification and send it in real-time
 */
const createAndSendNotification = async (io, notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    
    // Send real-time notification
    sendRealtimeNotification(io, notification.recipient, notification);
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create a notification when a bid is placed
 */
const notifyBidPlaced = async (io, artwork, bid, bidder) => {
  try {
    // Notify the artist
    await createAndSendNotification(io, {
      recipient: artwork.artist,
      type: 'bid_placed',
      message: `${bidder.name} placed a bid of ₦${bid.amount.toLocaleString()} on your artwork "${artwork.title}"`,
      relatedArtwork: artwork._id,
      relatedBid: bid._id,
      isRead: false
    });
    
    // Notify previous highest bidder if exists
    if (artwork.highestBidder && artwork.highestBidder.toString() !== bidder._id.toString()) {
      await createAndSendNotification(io, {
        recipient: artwork.highestBidder,
        type: 'outbid',
        message: `You've been outbid on "${artwork.title}". The new highest bid is ₦${bid.amount.toLocaleString()}`,
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
        await createAndSendNotification(io, {
          recipient: previousBidder,
          type: 'new_bid',
          message: `A new bid of ₦${bid.amount.toLocaleString()} was placed on "${artwork.title}"`,
          relatedArtwork: artwork._id,
          relatedBid: bid._id,
          isRead: false
        });
      }
    }
  } catch (error) {
    console.error('Error creating bid notifications:', error);
  }
};

/**
 * Create a notification when an auction ends
 */
const notifyAuctionEnded = async (io, artwork) => {
  try {
    // Notify the artist
    await createAndSendNotification(io, {
      recipient: artwork.artist,
      type: 'auction_ended',
      message: `Your auction for "${artwork.title}" has ended`,
      relatedArtwork: artwork._id,
      isRead: false
    });
    
    // Notify the winner if there is one
    if (artwork.winner) {
      await createAndSendNotification(io, {
        recipient: artwork.winner,
        type: 'auction_won',
        message: `Congratulations! You won the auction for "${artwork.title}" with a bid of ₦${artwork.currentBid.toLocaleString()}`,
        relatedArtwork: artwork._id,
        isRead: false
      });
    }
  } catch (error) {
    console.error('Error creating auction end notifications:', error);
  }
};

/**
 * Create a notification when artwork is approved
 */
const notifyArtworkApproved = async (io, artwork) => {
  try {
    await createAndSendNotification(io, {
      recipient: artwork.artist,
      type: 'artwork_approved',
      message: `Your artwork "${artwork.title}" has been approved and is now ready for auction!`,
      relatedArtwork: artwork._id,
      isRead: false
    });
  } catch (error) {
    console.error('Error creating artwork approval notification:', error);
  }
};

/**
 * Create a notification when artwork is rejected
 */
const notifyArtworkRejected = async (io, artwork, reason = '') => {
  try {
    await createAndSendNotification(io, {
      recipient: artwork.artist,
      type: 'artwork_rejected',
      message: `Your artwork "${artwork.title}" was not approved.${reason ? ` Reason: ${reason}` : ''}`,
      relatedArtwork: artwork._id,
      isRead: false
    });
  } catch (error) {
    console.error('Error creating artwork rejection notification:', error);
  }
};

/**
 * Create a notification when payment is completed
 */
const notifyPaymentCompleted = async (io, payment, artwork) => {
  try {
    // Notify the buyer
    await createAndSendNotification(io, {
      recipient: payment.user,
      type: 'payment_completed',
      message: `Payment completed for "${artwork.title}". Your artwork will be shipped soon!`,
      relatedArtwork: artwork._id,
      isRead: false
    });
    
    // Notify the artist
    await createAndSendNotification(io, {
      recipient: artwork.artist,
      type: 'payment_received',
      message: `Payment received for "${artwork.title}". Please ship the artwork to the buyer.`,
      relatedArtwork: artwork._id,
      isRead: false
    });
  } catch (error) {
    console.error('Error creating payment notifications:', error);
  }
};

/**
 * Create a notification when auction is about to end (reminder)
 */
const notifyAuctionEndingSoon = async (io, artwork) => {
  try {
    // Notify all bidders
    const bidders = await Bid.distinct('bidder', { artwork: artwork._id });
    
    for (const bidder of bidders) {
      await createAndSendNotification(io, {
        recipient: bidder,
        type: 'auction_ending_soon',
        message: `Auction for "${artwork.title}" ends in 1 hour! Current bid: ₦${artwork.currentBid.toLocaleString()}`,
        relatedArtwork: artwork._id,
        isRead: false
      });
    }
  } catch (error) {
    console.error('Error creating auction ending soon notifications:', error);
  }
};

/**
 * Mark notification as read
 */
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Get user's notifications
 */
const getUserNotifications = async (userId, limit = 50) => {
  try {
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('relatedArtwork', 'title imageUrl')
      .populate('relatedBid', 'amount');
    
    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

module.exports = {
  notifyBidPlaced,
  notifyAuctionEnded,
  notifyArtworkApproved,
  notifyArtworkRejected,
  notifyPaymentCompleted,
  notifyAuctionEndingSoon,
  markNotificationAsRead,
  getUserNotifications,
  getUnreadCount,
  sendRealtimeNotification
};