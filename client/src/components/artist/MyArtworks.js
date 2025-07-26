import React, { useState, useEffect, useContext } from 'react';
import {
  Grid, Container, Typography, Box, Button,
  FormControl, InputLabel, Select, MenuItem, Chip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  PlayArrow as StartAuctionIcon, Stop as EndAuctionIcon,
  Visibility as ViewIcon, ArrowBack as BackIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import ArtworkCard from '../artwork/ArtworkCard';
import { getMyArtworks, deleteArtwork } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const MyArtworks = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [myArtworks, setMyArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [artworkToDelete, setArtworkToDelete] = useState(null);

  useEffect(() => {
    const fetchMyArtworks = async () => {
      try {
        setLoading(true);
        const data = await getMyArtworks();
        setMyArtworks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching my artworks:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'artist') {
      fetchMyArtworks();
    }
  }, [user]);

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

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
      case 'pending': return 'Approved - Ready for Auction';
      case 'active': return 'Auction Active';
      case 'sold': return 'Sold';
      case 'expired': return 'Auction Expired';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const handleDeleteArtwork = (artwork) => {
    setArtworkToDelete(artwork);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteArtwork(artworkToDelete._id);
      setMyArtworks(myArtworks.filter(art => art._id !== artworkToDelete._id));
      setDeleteDialogOpen(false);
      setArtworkToDelete(null);
    } catch (error) {
      console.error('Error deleting artwork:', error);
    }
  };

  const handleStartAuction = (artworkId) => {
    navigate(`/artwork/${artworkId}`);
  };

  const handleEditArtwork = (artworkId) => {
    navigate(`/artwork/${artworkId}`);
  };

  const filteredMyArtworks = myArtworks.filter(artwork => {
    if (statusFilter === 'all') return true;
    return artwork.status === statusFilter;
  });

  if (!user || user.role !== 'artist') {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
          <Alert severity="error">
            You must be logged in as an artist to view your artworks.
          </Alert>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
          <Typography>Loading your artworks...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate('/artworks')}
            >
              Back to Artworks
            </Button>
            <Typography variant="h4" gutterBottom>
              My Artworks
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/upload-artwork"
            startIcon={<AddIcon />}
          >
            Upload New Artwork
          </Button>
        </Box>

        {/* Statistics */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label={`Total: ${myArtworks.length}`} color="primary" />
          <Chip label={`Waiting: ${myArtworks.filter(a => a.status === 'waiting').length}`} color="warning" />
          <Chip label={`Pending: ${myArtworks.filter(a => a.status === 'pending').length}`} color="info" />
          <Chip label={`Active: ${myArtworks.filter(a => a.status === 'active').length}`} color="success" />
          <Chip label={`Sold: ${myArtworks.filter(a => a.status === 'sold').length}`} color="primary" />
        </Box>

        {/* Filter */}
        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select 
              value={statusFilter} 
              label="Filter by Status" 
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="waiting">Waiting for Approval</MenuItem>
              <MenuItem value="pending">Approved - Ready for Auction</MenuItem>
              <MenuItem value="active">Auction Active</MenuItem>
              <MenuItem value="sold">Sold</MenuItem>
              <MenuItem value="expired">Auction Expired</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Artworks Grid */}
        {filteredMyArtworks.length === 0 ? (
          <Alert severity="info">
            {statusFilter === 'all' 
              ? "You haven't uploaded any artworks yet. Click 'Upload New Artwork' to get started!"
              : `No artworks with status '${getStatusLabel(statusFilter)}' found.`
            }
          </Alert>
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
              {filteredMyArtworks.map((artwork) => (
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
                  <Box sx={{ 
                    width: '100%', 
                    maxWidth: 350, 
                    display: 'flex', 
                    flexDirection: 'column',
                    pb: 2 // Add bottom padding to ensure space for buttons
                  }}>
                    {/* Artwork Card Container with Status Chip */}
                    <Box sx={{ position: 'relative' }}>
                      <ArtworkCard artwork={artwork} />
                      
                      {/* Status Chip */}
                      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                        <Chip 
                          label={getStatusLabel(artwork.status)} 
                          color={getStatusColor(artwork.status)} 
                          size="small" 
                        />
                      </Box>
                    </Box>

                    {/* Action Buttons - Now properly spaced below the card */}
                    <Box sx={{ 
                      mt: 2, 
                      display: 'flex', 
                      gap: 1, 
                      flexWrap: 'wrap',
                      p: 1 // Add padding around buttons
                    }}>
                      <Button 
                        component={Link} 
                        to={`/artwork/${artwork._id}`} 
                        variant="outlined" 
                        size="small" 
                        startIcon={<ViewIcon />}
                      >
                        View
                      </Button>
                      
                      {artwork.status === 'pending' && (
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="small" 
                          onClick={() => handleStartAuction(artwork._id)} 
                          startIcon={<StartAuctionIcon />}
                        >
                          Start Auction
                        </Button>
                      )}
                      
                      {artwork.status === 'active' && (
                        <Button 
                          variant="contained" 
                          color="secondary" 
                          size="small" 
                          onClick={() => handleStartAuction(artwork._id)} 
                          startIcon={<EndAuctionIcon />}
                        >
                          End Auction
                        </Button>
                      )}
                      
                      {['waiting', 'pending', 'expired', 'rejected'].includes(artwork.status) && (
                        <>
                          <Button 
                            variant="outlined" 
                            color="primary" 
                            size="small" 
                            onClick={() => handleEditArtwork(artwork._id)} 
                            startIcon={<EditIcon />}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small" 
                            onClick={() => handleDeleteArtwork(artwork)} 
                            startIcon={<DeleteIcon />}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Artwork</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{artworkToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyArtworks; 