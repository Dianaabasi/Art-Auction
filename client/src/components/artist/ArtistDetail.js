import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Typography, Avatar, Box, 
  Divider, Paper, CircularProgress 
} from '@mui/material';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ArtworkCard from '../artwork/ArtworkCard';

const ArtistDetail = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const [artistResponse, artworksResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/users/artists/${id}`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/artworks/artist/${id}`)
        ]);

        setArtist(artistResponse.data);
        setArtworks(artworksResponse.data);
      } catch (error) {
        console.error('Error fetching artist data:', error);
        setError('Failed to load artist information');
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !artist) {
    return (
      <Container>
        <Typography color="error" align="center" sx={{ mt: 4 }}>
          {error || 'Artist not found'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Avatar
              src={artist.profilePhoto ? `${process.env.REACT_APP_API_URL}${artist.profilePhoto}` : undefined}
              alt={artist.name}
              sx={{
                width: 200,
                height: 200,
                margin: '0 auto',
                border: '4px solid #fff',
                boxShadow: 3,
                bgcolor: 'primary.main', // Default background color when no image
                fontSize: '4rem' // Larger font size for the fallback letter
              }}
            >
              {!artist.profilePhoto && artist.name.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {artist.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {artist.bio || 'No bio available'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Artist's Artworks Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Artworks by {artist.name}
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={3}>
          {artworks.length > 0 ? (
            artworks.map((artwork) => (
              <Grid item xs={12} sm={6} md={4} key={artwork._id}>
                <ArtworkCard artwork={artwork} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" align="center" color="text.secondary">
                No artworks available yet
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default ArtistDetail;