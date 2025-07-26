import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
  forceNew: true
});

export const joinUserRoom = (userId) => {
  if (userId) {
    socket.emit('join-user-room', userId);
  }
};

export const leaveUserRoom = (userId) => {
  if (userId) {
    socket.emit('leave-user-room', userId);
  }
};

export const joinAuctionRoom = (artworkId) => {
  if (artworkId) {
    socket.emit('join-auction', { artworkId });
  }
};

export const leaveAuctionRoom = (artworkId) => {
  if (artworkId) {
    socket.emit('leave-auction', { artworkId });
  }
};

export const onNotification = (callback) => {
  socket.on('notification', callback);
};

export const onBidPlaced = (callback) => {
  socket.on('bid-placed', callback);
};

export const onAuctionEnded = (callback) => {
  socket.on('auction-ended', callback);
};

export const onAuctionStarted = (callback) => {
  socket.on('auction-started', callback);
};

export const disconnect = () => {
  socket.disconnect();
};

export default socket;