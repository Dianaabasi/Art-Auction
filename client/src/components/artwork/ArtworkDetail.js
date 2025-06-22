import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Grid, Typography, Paper, Button, Box,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Snackbar, Alert
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { getArtworkById, startAuction, endAuction, getArtworkBids } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import BidForm from '../auction/BidForm';
import BidHistory from '../auction/BidHistory';
import io from 'socket.io-client';

const ArtworkDetail = () => {
  const { id } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const [artwork, setArtwork] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [auctionDuration, setAuctionDuration] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Move fetchBids definition before it's used in useEffect
  const fetchBids = async () => {
    try {
      const bidsData = await getArtworkBids(id);
      setBids(bidsData);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  // Combine the two useEffect hooks into one
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const data = await getArtworkById(id);
        setArtwork(data);
        await fetchBids();
      } catch (error) {
        console.error('Error fetching artwork:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArtwork();

    // Fix Socket.IO configuration and connection
    const socket = io(process.env.REACT_APP_API_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      // Fix: Send artworkId as an object
      socket.emit('join-auction', { artworkId: id });
    });
    
    socket.on('bid-placed', (data) => {
      if (data.artworkId === id) {
        setArtwork(prev => ({
          ...prev,
          currentBid: data.amount,
          totalBids: (prev.totalBids || 0) + 1
        }));
        fetchBids();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      socket.off('connect');
      socket.off('bid-placed');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [id]);

  // Move handleStartAuction inside component
  const handleStartAuction = async () => {
    if (!auctionDuration) {
      setNotification({
        open: true,
        message: 'Please set auction duration',
        severity: 'error'
      });
      return;
    }

    try {
      const response = await startAuction(artwork._id, {
        duration: parseInt(auctionDuration)
      });
      setArtwork(response);
      await fetchBids();
      setOpenDialog(false);
      setNotification({
        open: true,
        message: 'Auction started successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error starting auction:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to start auction. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleBidPlaced = async (updatedBid) => {
    try {
      // Update artwork with new bid information
      setArtwork(prev => ({
        ...prev,
        currentBid: updatedBid.amount,
        totalBids: (prev.totalBids || 0) + 1
      }));
      // Fetch updated bids
      const bidsData = await getArtworkBids(id);
      setBids(bidsData || []);
    } catch (error) {
      console.error('Error updating bids:', error);
    }
  };

  const canEdit = () => {
    if (!artwork || !currentUser || !artwork.artist) return false;
    return artwork.artist._id === currentUser._id;
  };

  const [isWithinAuctionTime, setIsWithinAuctionTime] = useState(false);

  // Update auction time check whenever artwork changes
  useEffect(() => {
    const checkAuctionTime = () => {
      if (artwork && artwork.auctionStartTime && artwork.auctionEndTime) {
        const now = new Date();
        const startTime = new Date(artwork.auctionStartTime);
        const endTime = new Date(artwork.auctionEndTime);
        const isWithin = now >= startTime && now <= endTime;
        console.log('Time check:', { now, startTime, endTime, isWithin });
        setIsWithinAuctionTime(isWithin);
      } else {
        setIsWithinAuctionTime(false);
      }
    };

    checkAuctionTime();
    // Update every second to keep the time check current
    const interval = setInterval(checkAuctionTime, 1000);
    return () => clearInterval(interval);
  }, [artwork]);

  const canBid = () => {
    if (!artwork || !currentUser) return false;
    
    // Check if auction is active
    const isActive = artwork.status === 'active';
    
    // Check if user is not the artist
    const isNotArtist = artwork.artist._id !== currentUser._id;
    
    // Check if within auction time
    const isWithinTime = isWithinAuctionTime;
    
    console.log('Bid checks:', { 
      isActive, 
      isWithinTime, 
      isNotArtist, 
      startTime: artwork.auctionStartTime, 
      endTime: artwork.auctionEndTime 
    });
    
    return isActive && isWithinTime && isNotArtist;
  };

  const canStartAuction = () => {
    if (!artwork || !currentUser) return false;
    const isArtist = artwork.artist._id === currentUser._id;
    const isPending = artwork.status === 'pending';
    const isExpired = artwork.status === 'expired';
    return isArtist && (isPending || isExpired);
  };

  const canEndAuction = () => {
    if (!artwork || !currentUser) return false;
    const isArtist = artwork.artist._id === currentUser._id;
    return isArtist && artwork.status === 'active' && isWithinAuctionTime;
  };

  const handleEndAuction = async () => {
    try {
      const response = await endAuction(artwork._id);
      setArtwork(response);
      await fetchBids();
      const newStatus = response.totalBids > 0 ? 'sold' : 'expired';
      setNotification({
        open: true,
        message: `Auction ${newStatus === 'sold' ? 'ended' : 'expired'} successfully!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error ending auction:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to end auction',
        severity: 'error'
      });
    }
  };

  // Update the return JSX to use canStartAuction
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography>Loading artwork details...</Typography>
        </Box>
      ) : !artwork ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography>Artwork not found</Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <img
                src={`${process.env.REACT_APP_API_URL}${artwork.imageUrl}`}
                alt={artwork.title}
                style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                {artwork.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                By {artwork.artist?.name}
              </Typography>
              <Typography variant="body1" paragraph>
                {artwork.description}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Current Bid: ${artwork.currentBid || artwork.startingPrice}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Bids: {artwork.totalBids || 0}
              </Typography>

              {canEdit() && (
                <Box sx={{ mt: 2 }}>
                  {canStartAuction() && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setOpenDialog(true)}
                      sx={{ mr: 2 }}
                    >
                      {artwork.status === 'expired' ? 'Restart Auction' : 'Start Auction'}
                    </Button>
                  )}
                  {artwork.status === 'active' && canEndAuction() && (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleEndAuction}
                    >
                      End Auction
                    </Button>
                  )}
                </Box>
              )}

              {canBid() && (
                <Box sx={{ mt: 3 }}>
                  <BidForm
                    artworkId={artwork._id}
                    currentBid={artwork.currentBid || artwork.startingPrice}
                    onBidPlaced={handleBidPlaced}
                  />
                </Box>
              )}

              {artwork.status === 'active' && currentUser && !canBid() && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                  {artwork.artist._id === currentUser._id 
                    ? 'Artists cannot bid on their own artwork'
                    : !isWithinAuctionTime 
                      ? 'This auction is not currently active'
                      : 'You cannot place bids at this time'}
                </Typography>
              )}

              {artwork.status === 'active' && !currentUser && (
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                  Please log in to place bids
                </Typography>
              )}
              {artwork.status === 'sold' && (
                <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                  This artwork has been sold
                </Typography>
              )}

              {artwork.status === 'expired' && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  This auction has expired without any bids
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Bid History
              </Typography>
              <BidHistory bids={bids} />
            </Paper>
          </Grid>
        </Grid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {artwork?.status === 'expired' ? 'Restart Auction' : 'Start Auction'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Auction Duration (hours)"
            type="number"
            fullWidth
            value={auctionDuration}
            onChange={(e) => setAuctionDuration(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleStartAuction} color="primary">
            {artwork?.status === 'expired' ? 'Restart' : 'Start'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ArtworkDetail;