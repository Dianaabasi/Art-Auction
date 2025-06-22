import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Grid } from '@mui/material';
import { getAuctionById } from '../../services/api';
import BidForm from './BidForm';
import Timer from './Timer';

const Auction = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const data = await getAuctionById(id); // Changed from getAuctionDetails to getAuctionById
        setAuction(data);
      } catch (error) {
        console.error('Error fetching auction:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!auction) return <div>Auction not found</div>;

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <img 
            src={auction.artwork.imageUrl} 
            alt={auction.artwork.title} 
            style={{ width: '100%', height: 'auto' }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h4" gutterBottom>
            {auction.artwork.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {auction.artwork.description}
          </Typography>
          <Timer endTime={auction.endTime} />
          <Typography variant="h5" gutterBottom>
            Current Bid: ${auction.currentPrice}
          </Typography>
          <BidForm onBid={(amount) => console.log('Bid placed:', amount)} currentPrice={auction.currentPrice} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Auction;