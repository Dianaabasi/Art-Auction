import React, { useState, useEffect } from 'react';
import { Grid, Container, Typography } from '@mui/material';
import { ArtworkCard } from './artwork';
import { getAllArtworks } from '../services/api';
import RecentArtworksSlider from './home/RecentArtworksSlider';

const Home = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const data = await getAllArtworks();
        setArtworks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching artworks:', error);
        setArtworks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Container maxWidth="lg">
      <RecentArtworksSlider />
      <Typography variant="h2" component="h1" gutterBottom>
        Featured Artworks
      </Typography>
      <Grid container spacing={3}>
        {Array.isArray(artworks) && artworks.length > 0 ? (
          artworks.map((artwork) => (
            <Grid item xs={12} sm={6} md={4} key={artwork._id}>
              <ArtworkCard artwork={artwork} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="h6" align="center">
              No artworks available
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Home;
