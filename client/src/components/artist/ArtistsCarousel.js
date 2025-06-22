import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, IconButton, Avatar, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const CarouselContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  padding: theme.spacing(4, 0),
  marginBottom: theme.spacing(4)
}));

const ArtistCard = styled(Card)(({ theme }) => ({
  margin: '0 8px',
  cursor: 'pointer',
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)'
  }
}));

const ArtistsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'hidden',
  scrollBehavior: 'smooth',
  padding: theme.spacing(2),
  gap: theme.spacing(2)
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

const ArtistsCarousel = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/artists`);
        if (response.data) {
          setArtists(response.data);
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
        setError('Failed to fetch artists');
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const handleScroll = (direction) => {
    const container = document.getElementById('artists-container');
    const scrollAmount = 300;
    if (container) {
      if (direction === 'next') {
        container.scrollLeft += scrollAmount;
        setScrollPosition(container.scrollLeft + scrollAmount);
      } else {
        container.scrollLeft -= scrollAmount;
        setScrollPosition(container.scrollLeft - scrollAmount);
      }
    }
  };

  const handleArtistClick = (artistId) => {
    if (isAuthenticated) {
      navigate(`/artist/${artistId}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <CarouselContainer>
      <Typography variant="h5" gutterBottom sx={{ ml: 2 }}>
        Featured Artists
      </Typography>
      <Box sx={{ position: 'relative' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Typography>Loading artists...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : artists.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Typography>No artists found</Typography>
          </Box>
        ) : (
          <>
            {scrollPosition > 0 && (
              <NavigationButton
                onClick={() => handleScroll('prev')}
                sx={{ left: 0 }}
              >
                <NavigateBeforeIcon />
              </NavigationButton>
            )}
            
            <ArtistsContainer id="artists-container">
              {artists.map((artist) => (
                <ArtistCard 
                  key={artist._id}
                  onClick={() => handleArtistClick(artist._id)}
                  sx={{ 
                    minWidth: 200, 
                    flexShrink: 0,
                    cursor: isAuthenticated ? 'pointer' : 'default'
                  }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar
                      src={artist.profilePhoto ? `${process.env.REACT_APP_API_URL}${artist.profilePhoto}` : undefined}
                      alt={artist.name}
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        margin: '0 auto 16px',
                        bgcolor: 'primary.main'
                      }}
                    >
                      {!artist.profilePhoto && artist.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6" noWrap>
                      {artist.name}
                    </Typography>
                    {!isAuthenticated && (
                      <Typography variant="caption" color="text.secondary">
                        Login to view details
                      </Typography>
                    )}
                  </CardContent>
                </ArtistCard>
              ))}
            </ArtistsContainer>
            
            {artists.length > 0 && (
              <NavigationButton
                onClick={() => handleScroll('next')}
                sx={{ right: 0 }}
              >
                <NavigateNextIcon />
              </NavigationButton>
            )}
          </>
        )}
      </Box>
    </CarouselContainer>
  );
};

export default ArtistsCarousel;