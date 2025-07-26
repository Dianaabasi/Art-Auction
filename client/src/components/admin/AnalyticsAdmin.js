import React, { useEffect, useState } from 'react';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Box, CircularProgress, Tabs, Tab
} from '@mui/material';
import { getBidAnalyticsAdmin, getAllBidsAdmin } from '../../services/api';

const AnalyticsAdmin = () => {
  const [analytics, setAnalytics] = useState({ activeUsers: [], activeArtworks: [] });
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const analyticsData = await getBidAnalyticsAdmin();
        setAnalytics(analyticsData);
        const allBids = await getAllBidsAdmin();
        setBids(allBids);
      } catch (error) {
        setAnalytics({ activeUsers: [], activeArtworks: [] });
        setBids([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Platform Analytics</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Most Active Users" />
        <Tab label="Most Active Artworks" />
        <Tab label="All Bids" />
      </Tabs>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Bid Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.activeUsers.map(user => (
                    <TableRow key={user.userId}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.bidCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Artwork</TableCell>
                    <TableCell>Bid Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.activeArtworks.map(artwork => (
                    <TableRow key={artwork.artworkId}>
                      <TableCell>{artwork.title}</TableCell>
                      <TableCell>{artwork.bidCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Artwork</TableCell>
                    <TableCell>Bidder</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bids.map(bid => (
                    <TableRow key={bid._id}>
                      <TableCell>{bid.artwork?.title}</TableCell>
                      <TableCell>{bid.bidder?.name} ({bid.bidder?.email})</TableCell>
                      <TableCell>₦{bid.amount?.toLocaleString()}</TableCell>
                      <TableCell>{new Date(bid.createdAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Paper>
  );
};

export default AnalyticsAdmin; 