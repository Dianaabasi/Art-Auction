import React, { useEffect, useState } from 'react';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Box, CircularProgress, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Tooltip, Alert, Grid, Card, CardContent, CardActions
} from '@mui/material';
import {
  Visibility, Stop, PlayArrow, Timer, Gavel, TrendingUp, People, AttachMoney
} from '@mui/icons-material';
import { getAllArtworksAdmin, endAuction } from '../../services/api';

const AuctionsAdmin = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const data = await getAllArtworksAdmin();
      setArtworks(data);
    } catch (error) {
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  const handleEndAuction = async (artworkId) => {
    setActionLoading(artworkId);
    try {
      await endAuction(artworkId);
      await fetchArtworks();
    } catch (error) {
      console.error('Error ending auction:', error);
    } finally {
      setActionLoading('');
    }
  };

  const handleViewDetails = (artwork) => {
    setSelectedArtwork(artwork);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedArtwork(null);
  };

  const getAuctionStatus = (artwork) => {
    if (artwork.status === 'active') {
      const now = new Date();
      const endTime = new Date(artwork.auctionEndTime);
      if (endTime < now) {
        return { status: 'expired', color: 'error', label: 'Expired' };
      }
      return { status: 'active', color: 'success', label: 'Active' };
    }
    return { status: artwork.status, color: 'default', label: artwork.status };
  };

  const formatTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getActiveAuctions = () => artworks.filter(artwork => artwork.status === 'active');
  const getPendingAuctions = () => artworks.filter(artwork => artwork.status === 'pending');
  const getCompletedAuctions = () => artworks.filter(artwork => ['sold', 'expired'].includes(artwork.status));

  const stats = {
    active: getActiveAuctions().length,
    pending: getPendingAuctions().length,
    completed: getCompletedAuctions().length,
    total: artworks.length
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Manage Auctions</Typography>
      
      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PlayArrow color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.active}</Typography>
              </Box>
              <Typography color="text.secondary">Active Auctions</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Timer color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.pending}</Typography>
              </Box>
              <Typography color="text.secondary">Pending Auctions</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Gavel color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.completed}</Typography>
              </Box>
              <Typography color="text.secondary">Completed Auctions</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">{stats.total}</Typography>
              </Box>
              <Typography color="text.secondary">Total Artworks</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Active Auctions Section */}
          {getActiveAuctions().length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                Active Auctions ({getActiveAuctions().length})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Artwork</TableCell>
                      <TableCell>Artist</TableCell>
                      <TableCell>Current Bid</TableCell>
                      <TableCell>Time Remaining</TableCell>
                      <TableCell>Total Bids</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getActiveAuctions().map(artwork => {
                      const auctionStatus = getAuctionStatus(artwork);
                      return (
                        <TableRow key={artwork._id}>
                          <TableCell>
                            <Button onClick={() => handleViewDetails(artwork)}>
                              {artwork.title}
                            </Button>
                          </TableCell>
                          <TableCell>{artwork.artist?.name}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AttachMoney color="primary" sx={{ mr: 0.5 }} />
                              {artwork.currentBid ? `₦${artwork.currentBid.toLocaleString()}` : 'No bids'}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Timer color="warning" sx={{ mr: 0.5 }} />
                              {formatTimeRemaining(artwork.auctionEndTime)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <People color="info" sx={{ mr: 0.5 }} />
                              {artwork.totalBids || 0}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={auctionStatus.label} 
                              color={auctionStatus.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(artwork)}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="End Auction">
                                <IconButton
                                  color="error"
                                  size="small"
                                  disabled={actionLoading === artwork._id}
                                  onClick={() => handleEndAuction(artwork._id)}
                                >
                                  <Stop />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Pending Auctions Section */}
          {getPendingAuctions().length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
                Pending Auctions ({getPendingAuctions().length})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Artwork</TableCell>
                      <TableCell>Artist</TableCell>
                      <TableCell>Starting Price</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getPendingAuctions().map(artwork => (
                      <TableRow key={artwork._id}>
                        <TableCell>
                          <Button onClick={() => handleViewDetails(artwork)}>
                            {artwork.title}
                          </Button>
                        </TableCell>
                        <TableCell>{artwork.artist?.name}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AttachMoney color="primary" sx={{ mr: 0.5 }} />
                            ₦{artwork.startingPrice?.toLocaleString()}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label="Pending" color="warning" size="small" />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(artwork)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Completed Auctions Section */}
          {getCompletedAuctions().length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ color: 'info.main' }}>
                Completed Auctions ({getCompletedAuctions().length})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Artwork</TableCell>
                      <TableCell>Artist</TableCell>
                      <TableCell>Final Price</TableCell>
                      <TableCell>Winner</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getCompletedAuctions().map(artwork => (
                      <TableRow key={artwork._id}>
                        <TableCell>
                          <Button onClick={() => handleViewDetails(artwork)}>
                            {artwork.title}
                          </Button>
                        </TableCell>
                        <TableCell>{artwork.artist?.name}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AttachMoney color="primary" sx={{ mr: 0.5 }} />
                            ₦{artwork.currentBid?.toLocaleString() || artwork.startingPrice?.toLocaleString()}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {artwork.winner ? artwork.winner.name : 'No winner'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={artwork.status === 'sold' ? 'Sold' : 'Expired'} 
                            color={artwork.status === 'sold' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(artwork)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {artworks.length === 0 && (
            <Alert severity="info">No auctions found.</Alert>
          )}
        </>
      )}

      {/* Artwork Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>Auction Details</DialogTitle>
        <DialogContent>
          {selectedArtwork && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">{selectedArtwork.title}</Typography>
                  <Typography>Artist: {selectedArtwork.artist?.name}</Typography>
                  <Typography>Status: {selectedArtwork.status}</Typography>
                  <Typography>Starting Price: ₦{selectedArtwork.startingPrice?.toLocaleString()}</Typography>
                  <Typography>Current Bid: ₦{selectedArtwork.currentBid?.toLocaleString() || 'No bids'}</Typography>
                  <Typography>Total Bids: {selectedArtwork.totalBids || 0}</Typography>
                  {selectedArtwork.auctionStartTime && (
                    <Typography>
                      Start Time: {new Date(selectedArtwork.auctionStartTime).toLocaleString()}
                    </Typography>
                  )}
                  {selectedArtwork.auctionEndTime && (
                    <Typography>
                      End Time: {new Date(selectedArtwork.auctionEndTime).toLocaleString()}
                    </Typography>
                  )}
                  {selectedArtwork.winner && (
                    <Typography>Winner: {selectedArtwork.winner.name}</Typography>
                  )}
                  <Typography>Description: {selectedArtwork.description}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  {selectedArtwork.imageUrl && (
                    <img 
                      src={`${process.env.REACT_APP_API_URL}${selectedArtwork.imageUrl}`} 
                      alt={selectedArtwork.title} 
                      style={{ maxWidth: '100%', borderRadius: '8px' }} 
                    />
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AuctionsAdmin; 