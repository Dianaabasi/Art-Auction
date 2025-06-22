const socketIO = require('socket.io');

const setupWebSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });
  
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Join auction room
    socket.on('join-auction', ({ artworkId }) => {
      socket.join(`auction:${artworkId}`);
      console.log(`Client ${socket.id} joined auction room for artwork ${artworkId}`);
    });
    
    // Leave auction room
    socket.on('leave-auction', ({ artworkId }) => {
      socket.leave(`auction:${artworkId}`);
      console.log(`Client ${socket.id} left auction room for artwork ${artworkId}`);
    });
    
    // Disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  return io;
};

module.exports = setupWebSocket;