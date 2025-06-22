import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorMessage from './components/common/ErrorMessage';

// Page Components
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Admin from './components/admin/Admin';
import Auction from './components/auction/Auction';
import { ArtworkUpload, Artworks } from './components/artwork';
import ArtworkDetail from './components/artwork/ArtworkDetail'; // Add this import
import Profile from './components/user/Profile';
import MyBids from './components/user/MyBids';
import ArtistDetail from './components/artist/ArtistDetail';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { AuctionProvider } from './context/AuctionContext';
import { ErrorProvider } from './context/ErrorContext';
import { NotificationProvider } from './context/NotificationContext';

// Route Protection
import ProtectedRoute from './components/auth/ProtectedRoute';

// Styles
import './styles/global.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <ErrorProvider>
        <AuthProvider>
          <NotificationProvider>
            <AuctionProvider>
              <Router>
                <div className="app">
                  <Navbar />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/admin" element={
                        <ProtectedRoute adminOnly={true}>
                          <Admin />
                        </ProtectedRoute>
                      } />
                      <Route path="/upload-artwork" element={
                        <ProtectedRoute>
                          <ArtworkUpload />
                        </ProtectedRoute>
                      } />
                      <Route path="/auction/:id" element={
                        <ProtectedRoute>
                          <Auction />
                        </ProtectedRoute>
                      } />
                      <Route path="/artwork/:id" element={
                        <ProtectedRoute>
                          <ArtworkDetail />
                        </ProtectedRoute>
                      } />
                      <Route path="/artworks" element={<Artworks />} />
                      <Route path="/artist/:id" element={<ArtistDetail />} />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      <Route path="/my-bids" element={
                        <ProtectedRoute>
                          <MyBids />
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </main>
                  <Footer />
                  <ErrorMessage />
                </div>
              </Router>
            </AuctionProvider>
          </NotificationProvider>
        </AuthProvider>
      </ErrorProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
