import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { Link } from 'react-router-dom';
import axios from 'axios';

const SliderContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '400px',
  marginBottom: theme.spacing(4),
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3]
}));

const SlideImage = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  position: 'absolute',
  transition: 'all 0.5s ease-in-out'
}));

const SlideImg = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center'
});

const SlideContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(3),
  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  color: 'white'
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(255,255,255,0.3)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(255,255,255,0.5)'
  }
}));

const RecentArtworksSlider = () => {
  const [artworks, setArtworks] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const fetchRecentArtworks = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/artworks/recent`);
        setArtworks(response.data);
      } catch (error) {
        console.error('Error fetching recent artworks:', error);
      }
    };

    fetchRecentArtworks();

    // Auto-advance slides every 5 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % artworks.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [artworks.length]);

  const handleImageError = (artworkId) => {
    console.error('Slider image failed to load for artwork:', artworkId);
    setImageErrors(prev => ({ ...prev, [artworkId]: true }));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % artworks.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + artworks.length) % artworks.length);
  };

  if (!artworks.length) return null;

  return (
    <SliderContainer>
      {artworks.map((artwork, index) => (
        <SlideImage
          key={artwork._id}
          sx={{
            opacity: currentSlide === index ? 1 : 0,
            transform: `translateX(${(index - currentSlide) * 100}%)`,
            zIndex: currentSlide === index ? 1 : 0
          }}
        >
          {imageErrors[artwork._id] ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                bgcolor: 'grey.200',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Typography color="text.secondary">Image not available</Typography>
            </Box>
          ) : (
            <SlideImg
              src={`${process.env.REACT_APP_API_URL}${artwork.imageUrl}`}
              alt={artwork.title}
              onError={() => handleImageError(artwork._id)}
            />
          )}
        </SlideImage>
      ))}
      <SlideContent>
        <Typography variant="h4" gutterBottom>
          {artworks[currentSlide]?.title}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          by {artworks[currentSlide]?.artist.name}
        </Typography>
        {imageErrors[artworks[currentSlide]?._id] && (
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
            Image not available
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/artworks"
          sx={{ mt: 2 }}
        >
          Explore Now
        </Button>
      </SlideContent>
      <NavigationButton
        sx={{ left: 16 }}
        onClick={handlePrev}
      >
        <NavigateBeforeIcon />
      </NavigationButton>
      <NavigationButton
        sx={{ right: 16 }}
        onClick={handleNext}
      >
        <NavigateNextIcon />
      </NavigationButton>
    </SliderContainer>
  );
};

export default RecentArtworksSlider;