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

export const onNotification = (callback) => {
  socket.on('notification', callback);
};

export default socket;