import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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
import MyArtworks from './components/artist/MyArtworks';
import AdminDashboard from './components/admin/AdminDashboard';
import PaymentCallback from './components/payment/PaymentCallback';
import ArtistPayoutMethod from './components/profile/ArtistPayoutMethod';
import AdminLogin from './components/admin/AdminLogin';

// Context Providers
import { AuthProvider, AuthContext } from './context/AuthContext';
import { AuctionProvider } from './context/AuctionContext';
import { ErrorProvider } from './context/ErrorContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';

// Route Protection
import ProtectedRoute from './components/auth/ProtectedRoute';

// Styles
import './styles/global.css';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { onNotification } from './services/websocket';
import { Snackbar, Alert } from '@mui/material';

function NotificationListener() {
  const { addNotification } = useNotifications();
  useEffect(() => {
    onNotification((data) => {
      if (addNotification) {
        addNotification({
          id: Date.now(),
          message: data.message,
          read: false,
          timestamp: new Date().toISOString(),
        });
      }
    });
  }, [addNotification]);
  return null;
}

function App() {
  const { user } = React.useContext(AuthContext);
  const [notification, setNotification] = React.useState({ open: false, message: '', severity: 'info' });

  React.useEffect(() => {
    onNotification((data) => {
      setNotification({ open: true, message: data.message, severity: 'info' });
    });
  }, []);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <ErrorProvider>
        <NotificationProvider>
          <NotificationListener />
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
                      user && user.role === 'admin'
                        ? <AdminDashboard />
                        : <AdminLogin onSuccess={() => window.location.reload()} />
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
                    <Route path="/artwork/:id" element={user ? <ArtworkDetail /> : <Navigate to="/login" />} />
                    <Route path="/artworks" element={<Artworks />} />
                    <Route path="/artist/:id" element={user ? <ArtistDetail /> : <Navigate to="/login" />} />
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
                    <Route path="/my-artworks" element={
                      <ProtectedRoute>
                        <MyArtworks />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile/payout-method" element={<ArtistPayoutMethod />} />
                    <Route path="/payment/callback" element={<PaymentCallback />} />
                  </Routes>
                </main>
                <Footer />
                <ErrorMessage />
                <Snackbar
                  open={notification.open}
                  autoHideDuration={4000}
                  onClose={() => setNotification({ ...notification, open: false })}
                >
                  <Alert severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                  </Alert>
                </Snackbar>
              </div>
            </Router>
          </AuctionProvider>
        </NotificationProvider>
      </ErrorProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
