import React, { useState, useEffect } from 'react';
import { Grid, Container, Typography } from '@mui/material';
import ArtworkCard from './ArtworkCard';
import ArtistsCarousel from '../artist/ArtistsCarousel';
import { getAllArtworks } from '../../services/api';

const Artworks = () => {
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
      <Typography variant="h4" gutterBottom>
        Available Artworks
      </Typography>
      <Grid container spacing={3}>
        {artworks.length > 0 ? (
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
      
      <ArtistsCarousel />
    </Container>
  );
};

export default Artworks;