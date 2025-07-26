import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Grid, Card, CardContent, Button, CircularProgress,
  Box, Chip, Divider, Tabs, Tab, Alert
} from '@mui/material';
import { CheckCircle, Payment, Gavel, ShoppingCart } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { getUserBids, initializePayment } from '../../services/api';

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

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

  const handlePayNow = async (bid) => {
    try {
      const data = await initializePayment(bid.amount, bid.artwork._id);
      window.location.href = data.authorization_url;
    } catch (error) {
      alert('Failed to initialize payment');
    }
  };

  // Categorize bids
  const activeBids = bids.filter(bid =>
    bid.artwork.status === 'active' &&
    !bid.isWinner
  );

  // Get unique won auctions with highest bid for each artwork
  const wonAuctions = bids
    .filter(bid =>
      bid.isWinner &&
      !bid.paymentCompleted
    )
    .reduce((acc, bid) => {
      const existingBid = acc.find(b => b.artwork._id === bid.artwork._id);
      if (!existingBid || bid.amount > existingBid.amount) {
        // Remove existing bid and add this one (higher amount)
        const filtered = acc.filter(b => b.artwork._id !== bid.artwork._id);
        return [...filtered, bid];
      }
      return acc;
    }, []);

  // Get unique paid artworks with highest bid for each artwork
  const paidArtworks = bids
    .filter(bid =>
      bid.isWinner &&
      bid.paymentCompleted
    )
    .reduce((acc, bid) => {
      const existingBid = acc.find(b => b.artwork._id === bid.artwork._id);
      if (!existingBid || bid.amount > existingBid.amount) {
        // Remove existing bid and add this one (higher amount)
        const filtered = acc.filter(b => b.artwork._id !== bid.artwork._id);
        return [...filtered, bid];
      }
      return acc;
    }, []);

  const renderBidCard = (bid, showPayButton = false) => (
    <Grid item xs={12} md={6} lg={4} key={bid._id}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>{bid.artwork.title}</Typography>
          <Typography color="textSecondary" gutterBottom>
            Artist: {bid.artwork.artist?.name}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            Winning Bid: ₦{bid.amount?.toLocaleString()}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            Starting Price: ₦{bid.artwork.startingPrice?.toLocaleString()}
          </Typography>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Chip
              label={bid.artwork.status}
              color={bid.artwork.status === 'active' ? 'primary' : bid.artwork.status === 'sold' ? 'success' : 'default'}
              size="small"
            />
            {!bid.paymentCompleted && (
              <Chip
                label="Payment Pending"
                color="warning"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
            {bid.paymentCompleted && (
              <Chip
                label="Paid"
                color="success"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Box>

          <Box sx={{ mt: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              to={`/artwork/${bid.artwork._id}`}
              variant="outlined"
              size="small"
            >
              View Artwork
            </Button>
            {showPayButton && (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={() => handlePayNow(bid)}
                startIcon={<Payment />}
              >
                Pay Now
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        My Bids
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab
          label={`Active Bids (${activeBids.length})`}
          icon={<Gavel />}
          iconPosition="start"
        />
        <Tab
          label={`Won Auctions (${wonAuctions.length})`}
          icon={<Payment />}
          iconPosition="start"
        />
        <Tab
          label={`Paid Artworks (${paidArtworks.length})`}
          icon={<CheckCircle />}
          iconPosition="start"
        />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {activeTab === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Active Bids
          </Typography>
          {activeBids.length === 0 ? (
            <Alert severity="info">No active bids found.</Alert>
          ) : (
            <Grid container spacing={3}>
              {activeBids.map(bid => renderBidCard(bid))}
            </Grid>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Won Auctions
          </Typography>
          {wonAuctions.length === 0 ? (
            <Alert severity="info">No won auctions pending payment.</Alert>
          ) : (
            <Grid container spacing={3}>
              {wonAuctions.map(bid => renderBidCard(bid, true))}
            </Grid>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Paid Artworks
          </Typography>
          {paidArtworks.length === 0 ? (
            <Alert severity="info">No paid artworks found.</Alert>
          ) : (
            <Grid container spacing={3}>
              {paidArtworks.map(bid => renderBidCard(bid))}
            </Grid>
          )}
        </Box>
      )}
    </Container>
  );
};

export default MyBids;