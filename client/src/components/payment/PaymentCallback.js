import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyPayment } from '../../services/api';
import { Box, Typography, CircularProgress, Button } from '@mui/material';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('Verifying payment...');
  const navigate = useNavigate();

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference) {
      verifyPayment(reference)
        .then(res => {
          if (res.status === 'completed') {
            setStatus('success');
            setMessage('Payment successful! Thank you for your purchase.');
          } else {
            setStatus('failed');
            setMessage('Payment failed or incomplete. Please try again.');
          }
        })
        .catch(() => {
          setStatus('failed');
          setMessage('Payment verification failed.');
        });
    } else {
      setStatus('failed');
      setMessage('No payment reference found.');
    }
  }, [searchParams]);

  return (
    <Box sx={{ mt: 8, textAlign: 'center' }}>
      {status === 'pending' && <CircularProgress />}
      <Typography variant="h5" sx={{ mt: 2 }}>{message}</Typography>
      <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate('/')}>Go to Home</Button>
    </Box>
  );
};

export default PaymentCallback; 