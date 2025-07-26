import React, { useContext } from 'react';
import { Card, CardMedia, CardContent, Typography, Button, Box, Chip, Stack } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ArtworkCard = ({ artwork }) => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const imageUrl = `${process.env.REACT_APP_API_URL}${artwork.imageUrl}`;
  
  // Calculate time remaining for auction
  const getAuctionStatus = () => {
    if (!artwork.auctionEndTime) return 'Not in auction';
    const now = new Date();
    const endTime = new Date(artwork.auctionEndTime);
    if (now > endTime) return 'Auction ended';
    
    const timeLeft = endTime - now;
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getStatusColor = () => {
    if (!artwork.auctionEndTime) return 'default';
    return new Date() > new Date(artwork.auctionEndTime) ? 'error' : 'success';
  };

  const handleViewArtwork = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login');
    }
  };

  const isAuctionActive = artwork.status === 'active' && new Date() < new Date(artwork.auctionEndTime);
  const isOwner = artwork.artist._id?.toString() === currentUser?._id?.toString();
  const buttonText = isAuctionActive && !isOwner ? 'Place Bid' : 'View Artwork';

  const canStartAuction = () => {
    if (!artwork || !currentUser) return false;
    const isArtist = artwork.artist._id === currentUser._id;
    const isPending = artwork.status === 'pending';
    const isExpired = artwork.status === 'expired';
    return isArtist && (isPending || isExpired);
  };

  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
      }
    }}>
      <CardMedia
        component="img"
        height="200"
        image={imageUrl}
        alt={artwork.title}
        onError={(e) => {
          console.error('Image failed to load:', imageUrl);
          console.error('Error details:', e);
          // Hide the image and show placeholder
          
          e.target.style.display = 'none';
          const placeholder = e.target.parentNode.querySelector('.image-placeholder');
          if (placeholder) {
            placeholder.style.display = 'flex';
          }
        }}
        sx={{
          transition: 'transform 0.3s',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}
      />
      {/* Fallback placeholder */}
      <Box
        className="image-placeholder"
        sx={{
          height: 200,
          display: 'none',
          bgcolor: 'grey.200',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography color="text.secondary">Image not available</Typography>
      </Box>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" noWrap sx={{ mb: 1 }}>{artwork.title}</Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {typeof artwork.artist === 'object' ? artwork.artist.name : artwork.artist}
        </Typography>
        
        <Box sx={{ flexGrow: 1 }}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" color="primary">
                Starting: ₦{artwork.startingPrice}
              </Typography>
              {artwork.currentBid && (
                <Typography variant="subtitle1" color="secondary" fontWeight="bold">
                  Current: ₦{artwork.currentBid}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip 
                label={getAuctionStatus()}
                color={getStatusColor()}
                size="small"
                sx={{ minWidth: '100px' }}
              />
              {artwork.totalBids > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {artwork.totalBids} bid{artwork.totalBids > 1 ? 's' : ''}
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>

        <Button 
          variant="contained" 
          color="primary" 
          fullWidth
          component={Link}
          to={`/artwork/${artwork._id}`}
          onClick={handleViewArtwork}
          sx={{ mt: 2 }}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ArtworkCard;