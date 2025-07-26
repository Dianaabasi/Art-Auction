import React, { useState, useEffect, useContext } from 'react';
import { 
  Grid, Container, Typography, Box, Button,
  FormControl, InputLabel, Select, MenuItem, Chip,
  TextField, Slider, Accordion, AccordionSummary,
  AccordionDetails, Divider
} from '@mui/material';
import {
  Palette as PaletteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import ArtworkCard from './ArtworkCard';
import ArtistsCarousel from '../artist/ArtistsCarousel';
import { getAllArtworks } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const Artworks = () => {
  const { user } = useContext(AuthContext);
  const [artworks, setArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [searchTerm, setSearchTerm] = useState('');
  const [artistFilter, setArtistFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
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
  }, [user]);

  // Apply filters whenever artworks or filter states change
  useEffect(() => {
    let filtered = [...artworks];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(artwork => artwork.status === statusFilter);
    }

    // Price range filter
    filtered = filtered.filter(artwork => {
      const currentBid = artwork.currentBid || artwork.startingPrice;
      return currentBid >= priceRange[0] && currentBid <= priceRange[1];
    });

    // Search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(artwork => 
        artwork.title.toLowerCase().includes(term) ||
        artwork.description.toLowerCase().includes(term) ||
        (artwork.artist && artwork.artist.name && artwork.artist.name.toLowerCase().includes(term))
      );
    }

    // Artist filter
    if (artistFilter !== 'all') {
      filtered = filtered.filter(artwork => 
        artwork.artist && artwork.artist._id === artistFilter
      );
    }

    // Sort artworks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price-low':
          return (a.currentBid || a.startingPrice) - (b.currentBid || b.startingPrice);
        case 'price-high':
          return (b.currentBid || b.startingPrice) - (a.currentBid || a.startingPrice);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredArtworks(filtered);
  }, [artworks, statusFilter, priceRange, searchTerm, artistFilter, sortBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'warning';
      case 'pending': return 'info';
      case 'active': return 'success';
      case 'sold': return 'primary';
      case 'expired': return 'error';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'waiting': return 'Waiting for Approval';
      case 'pending': return 'Ready for Auction';
      case 'active': return 'Auction Active';
      case 'sold': return 'Sold';
      case 'expired': return 'Expired';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setPriceRange([0, 1000000]);
    setSearchTerm('');
    setArtistFilter('all');
    setSortBy('newest');
  };

  const getUniqueArtists = () => {
    const artists = artworks
      .filter(artwork => artwork.artist)
      .map(artwork => artwork.artist);
    
    return artists.filter((artist, index, self) => 
      index === self.findIndex(a => a._id === artist._id)
    );
  };

  const getPriceRange = () => {
    if (artworks.length === 0) return [0, 1000000];
    
    const prices = artworks.map(artwork => 
      artwork.currentBid || artwork.startingPrice
    );
    return [Math.min(...prices), Math.max(...prices)];
  };

  const priceRangeData = getPriceRange();

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
          <Typography>Loading artworks...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Available Artworks
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {user && user.role === 'artist' && (
              <Button
                variant="outlined"
                color="primary"
                component={Link}
                to="/my-artworks"
                startIcon={<PaletteIcon />}
              >
                My Artworks
              </Button>
            )}
          </Box>
        </Box>

        {/* Filters Section */}
        {showFilters && (
          <Accordion defaultExpanded sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<FilterIcon />}>
              <Typography variant="h6">Filters & Search</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {/* Search */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Search artworks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>

                {/* Status Filter */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Statuses</MenuItem>
                      <MenuItem value="waiting">Waiting for Approval</MenuItem>
                      <MenuItem value="pending">Ready for Auction</MenuItem>
                      <MenuItem value="active">Auction Active</MenuItem>
                      <MenuItem value="sold">Sold</MenuItem>
                      <MenuItem value="expired">Expired</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Artist Filter */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Artist</InputLabel>
                    <Select
                      value={artistFilter}
                      label="Artist"
                      onChange={(e) => setArtistFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Artists</MenuItem>
                      {getUniqueArtists().map(artist => (
                        <MenuItem key={artist._id} value={artist._id}>
                          {artist.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Sort By */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      label="Sort By"
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <MenuItem value="newest">Newest First</MenuItem>
                      <MenuItem value="oldest">Oldest First</MenuItem>
                      <MenuItem value="price-low">Price: Low to High</MenuItem>
                      <MenuItem value="price-high">Price: High to Low</MenuItem>
                      <MenuItem value="title">Title A-Z</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Price Range */}
                <Grid item xs={12}>
                  <Typography gutterBottom>Price Range (₦)</Typography>
                  <Slider
                    value={priceRange}
                    onChange={(event, newValue) => setPriceRange(newValue)}
                    valueLabelDisplay="auto"
                    min={priceRangeData[0]}
                    max={priceRangeData[1]}
                    step={1000}
                    valueLabelFormat={(value) => `₦${value.toLocaleString()}`}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      ₦{priceRange[0].toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₦{priceRange[1].toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>

                {/* Clear Filters */}
                <Grid item xs={12}>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={clearFilters}
                    sx={{ mt: 1 }}
                  >
                    Clear All Filters
                  </Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Results Summary */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredArtworks.length} of {artworks.length} artworks
          </Typography>
          {filteredArtworks.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {statusFilter !== 'all' && (
                <Chip 
                  label={getStatusLabel(statusFilter)} 
                  color={getStatusColor(statusFilter)} 
                  size="small" 
                />
              )}
              {artistFilter !== 'all' && (
                <Chip 
                  label={`Artist: ${getUniqueArtists().find(a => a._id === artistFilter)?.name || 'Unknown'}`} 
                  color="primary" 
                  size="small" 
                />
              )}
              {searchTerm && (
                <Chip 
                  label={`Search: "${searchTerm}"`} 
                  color="secondary" 
                  size="small" 
                />
              )}
            </Box>
          )}
        </Box>

        {/* Artworks Grid */}
        {filteredArtworks.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="textSecondary">
              {artworks.length === 0 
                ? 'No artworks available at the moment.'
                : 'No artworks match your current filters.'
              }
            </Typography>
            {artworks.length > 0 && (
              <Button 
                variant="outlined" 
                onClick={clearFilters}
                sx={{ mt: 2 }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Grid 
              container 
              spacing={3} 
              sx={{ 
                maxWidth: '100%',
                justifyContent: 'center'
              }}
            >
              {filteredArtworks.map((artwork) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  lg={3}
                  key={artwork._id}
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Box sx={{ width: '100%', maxWidth: 350 }}>
                    <ArtworkCard artwork={artwork} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
      
      <ArtistsCarousel />
    </Container>
  );
};

export default Artworks;