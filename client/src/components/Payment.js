import React, { useState } from 'react';
import { usePayment } from '../hooks/usePayment';
import { Container, Paper, Typography, Button, TextField } from '@material-ui/core';

const Payment = ({ amount, auctionId }) => {
  const [loading, setLoading] = useState(false);
  const { processPayment } = usePayment();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await processPayment({
        amount,
        auctionId,
        currency: 'NGN'
      });
      window.location.href = response.authorization_url;
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper style={{ padding: 20, marginTop: 20 }}>
        <Typography variant="h5" gutterBottom>
          Complete Payment
        </Typography>
        <Typography variant="h6" gutterBottom>
          Amount to Pay: ₦{amount}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </Button>
      </Paper>
    </Container>
  );
};

export default Payment;