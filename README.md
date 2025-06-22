# Art Auction Platform

A full-stack web application for buying and selling artwork through auctions.

## Features

- User authentication with Google OAuth
- Artist and buyer roles
- Artwork upload and management
- Real-time auction bidding
- Socket.io for live updates
- Payment integration
- Admin dashboard

## Tech Stack

### Frontend
- React.js
- Material-UI
- Socket.io-client
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io
- JWT authentication

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Google OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TAuction
```

2. Install dependencies for both client and server:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Environment Configuration:

Create a `.env` file in the server directory with the following variables:
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/art-auction

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

Create a `.env` file in the client directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development servers:

```bash
# Start server (from server directory)
cd server
npm start

# Start client (from client directory)
cd client
npm start
```

## Usage

1. Register as an artist or buyer
2. Artists can upload artwork and start auctions
3. Buyers can browse artworks and place bids
4. Real-time updates show current bids and auction status
5. Admins can manage users and view platform statistics

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth

### Artworks
- `GET /api/artworks` - Get all artworks
- `POST /api/artworks` - Create artwork
- `GET /api/artworks/:id` - Get artwork by ID
- `POST /api/artworks/:id/auction` - Start auction
- `POST /api/artworks/:id/end` - End auction

### Bids
- `GET /api/bids/artwork/:id` - Get bids for artwork
- `POST /api/bids/:artworkId` - Place bid

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
