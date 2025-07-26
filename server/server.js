const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const setupWebSocket = require('./config/websocket');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Set up WebSocket
const io = setupWebSocket(server);
app.set('io', io);

// Socket.io: Join user room for notifications
io.on('connection', (socket) => {
  socket.on('join-user-room', (userId) => {
    if (userId) {
      socket.join(userId);
    }
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/artworks', require('./routes/artworks'));
app.use('/api/bids', require('./routes/bids'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));

// Error handling middleware
app.use(require('./middleware/errorHandler'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });