import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { getUserBids } from '../../services/api';

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const data = await getUserBids();
        setBids(data);
      } catch (error) {
        setError('Failed to load bids');
        console.error('Error fetching bids:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        My Bids
      </Typography>
      <Grid container spacing={3}>
        {bids.map((bid) => (
          <Grid item xs={12} key={bid._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{bid.artwork.title}</Typography>
                <Typography color="textSecondary">
                  Your Bid: ${bid.amount}
                </Typography>
                <Typography color="textSecondary">
                  Status: {bid.status}
                </Typography>
                <Button
                  component={Link}
                  to={`/artwork/${bid.artwork._id}`}
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  View Artwork
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MyBids;