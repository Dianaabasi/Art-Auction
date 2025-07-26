import React, { useState, useContext } from 'react';
import { 
  Box, TextField, Button, Typography, Paper, 
  InputAdornment, Alert, Divider 
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { ErrorContext } from '../../context/ErrorContext';
import { placeBid } from '../../services/api';

const BidForm = ({ artworkId, currentBid, minBidIncrement = 10, onBidPlaced }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const { showError } = useContext(ErrorContext);
  const [bidAmount, setBidAmount] = useState(currentBid + minBidIncrement);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBidChange = (e) => {
    const value = parseFloat(e.target.value);
    setBidAmount(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showError('Please log in to place a bid');
      return;
    }
    
    if (bidAmount <= currentBid) {
      showError(`Your bid must be higher than the current bid of ₦${currentBid}`);
      return;
    }

    try {
      setLoading(true);
      const response = await placeBid(artworkId, { amount: bidAmount });
      setSuccess(true);
      setBidAmount(response.currentBid + minBidIncrement); // Reset bid amount to new minimum
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
      // Call the callback to update parent component
      if (onBidPlaced) {
        onBidPlaced(response);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, mt: 2, bgcolor: '#f8f8f8' }}>
      <Typography variant="h6" gutterBottom>
        Place Your Bid
      </Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your bid was placed successfully!
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Bid Amount"
          type="number"
          value={bidAmount}
          onChange={handleBidChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">₦</InputAdornment>,
          }}
          sx={{ mb: 2 }}
          inputProps={{ 
            min: currentBid + minBidIncrement,
            step: minBidIncrement
          }}
        />
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Minimum bid: ₦{currentBid + minBidIncrement}
        </Typography>
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading || !isAuthenticated}
        >
          {loading ? 'Processing...' : 'Place Bid'}
        </Button>
        
        {!isAuthenticated && (
          <Typography variant="body2" color="error" sx={{ mt: 1, textAlign: 'center' }}>
            Please log in to place a bid
          </Typography>
        )}
      </form>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          By placing a bid, you agree to our Terms of Service and Privacy Policy.
        </Typography>
      </Box>
    </Paper>
  );
};

export default BidForm;