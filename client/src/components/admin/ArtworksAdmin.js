import React, { useEffect, useState } from 'react';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Select, MenuItem, Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { getAllArtworksAdmin, approveArtwork, rejectArtwork, removeArtwork } from '../../services/api';

const statusOptions = ['waiting', 'pending', 'active', 'expired', 'sold', 'rejected'];

const ArtworksAdmin = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await getAllArtworksAdmin(params);
      setArtworks(data);
    } catch (error) {
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
    // eslint-disable-next-line
  }, [statusFilter]);

  const handleApprove = async (artworkId) => {
    setActionLoading(artworkId + '-approve');
    await approveArtwork(artworkId);
    await fetchArtworks();
    setActionLoading('');
  };

  const handleReject = async (artworkId) => {
    setActionLoading(artworkId + '-reject');
    await rejectArtwork(artworkId);
    await fetchArtworks();
    setActionLoading('');
  };

  const handleRemove = async (artworkId) => {
    setActionLoading(artworkId + '-remove');
    await removeArtwork(artworkId);
    await fetchArtworks();
    setActionLoading('');
  };

  const handleShowDetails = (artwork) => {
    setSelectedArtwork(artwork);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedArtwork(null);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Manage Artworks</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          displayEmpty
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          {statusOptions.map(status => (
            <MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</MenuItem>
          ))}
        </Select>
        <Button variant="outlined" onClick={fetchArtworks}>Refresh</Button>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Artist</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Current Bid</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {artworks.map(artwork => (
                <TableRow key={artwork._id}>
                  <TableCell>
                    <Button onClick={() => handleShowDetails(artwork)}>{artwork.title}</Button>
                  </TableCell>
                  <TableCell>{artwork.artist?.name}</TableCell>
                  <TableCell>{artwork.status}</TableCell>
                  <TableCell>{artwork.currentBid ? `$${artwork.currentBid}` : '-'}</TableCell>
                  <TableCell>
                    {artwork.status === 'waiting' && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                        disabled={actionLoading === artwork._id + '-approve'}
                        onClick={() => handleApprove(artwork._id)}
                      >
                        Approve
                      </Button>
                    )}
                    {artwork.status === 'waiting' && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        sx={{ mr: 1 }}
                        disabled={actionLoading === artwork._id + '-reject'}
                        onClick={() => handleReject(artwork._id)}
                      >
                        Reject
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      disabled={actionLoading === artwork._id + '-remove'}
                      onClick={() => handleRemove(artwork._id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle>Artwork Details</DialogTitle>
        <DialogContent>
          {selectedArtwork && (
            <Box>
              <Typography variant="h6">{selectedArtwork.title}</Typography>
              <Typography>Artist: {selectedArtwork.artist?.name}</Typography>
              <Typography>Status: {selectedArtwork.status}</Typography>
              <Typography>Description: {selectedArtwork.description}</Typography>
              <Typography>Current Bid: {selectedArtwork.currentBid ? `$${selectedArtwork.currentBid}` : '-'}</Typography>
              <Typography>Starting Price: ${selectedArtwork.startingPrice}</Typography>
              <Typography>Auction Start: {selectedArtwork.auctionStartTime ? new Date(selectedArtwork.auctionStartTime).toLocaleString() : '-'}</Typography>
              <Typography>Auction End: {selectedArtwork.auctionEndTime ? new Date(selectedArtwork.auctionEndTime).toLocaleString() : '-'}</Typography>
              {selectedArtwork.imageUrl && (
                <Box sx={{ mt: 2 }}>
                  <img src={`${process.env.REACT_APP_API_URL}${selectedArtwork.imageUrl}`} alt={selectedArtwork.title} style={{ maxWidth: '100%' }} />
                </Box>
              )}
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

export default ArtworksAdmin; 