import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, TextField, Button, Paper, Alert } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import { getProfile, updateArtistPayoutMethod } from '../../services/api';

const ArtistPayoutMethod = () => {
  const { user } = useContext(AuthContext);
  const [payoutMethod, setPayoutMethod] = useState(user?.payoutMethod || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.payoutMethod) {
      getProfile().then(profile => setPayoutMethod(profile.payoutMethod || ''));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await updateArtistPayoutMethod(payoutMethod);
      setSuccess(true);
    } catch (err) {
      setError(err.error || 'Failed to update payout method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" gutterBottom>Artist Payout Method</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter your bank account or Paystack payout details to receive payments for sold artworks.
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Payout Method (e.g., Bank Account, Paystack ID)"
          value={payoutMethod}
          onChange={e => setPayoutMethod(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          {loading ? 'Saving...' : 'Save Payout Method'}
        </Button>
      </form>
      {success && <Alert severity="success" sx={{ mt: 2 }}>Payout method updated!</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Paper>
  );
};

export default ArtistPayoutMethod; 