import React from 'react';
import { 
  Box, Typography, List, ListItem, ListItemText, 
  Divider, Paper, Avatar 
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const BidHistory = ({ bids = [] }) => {
  if (!bids || bids.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, mt: 2, bgcolor: '#f8f8f8' }}>
        <Typography variant="subtitle1" align="center" color="text.secondary">
          No bids placed yet. Be the first to bid!
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ p: 3, mt: 2, bgcolor: '#f8f8f8' }}>
      <Typography variant="h6" gutterBottom>
        Bid History ({bids.length})
      </Typography>
      
      <List sx={{ maxHeight: 300, overflow: 'auto' }}>
        {bids.map((bid, index) => (
          <React.Fragment key={bid._id || index}>
            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
              <Avatar 
                src={bid.bidder.profilePhoto} 
                alt={bid.bidder.name}
                sx={{ mr: 2, width: 40, height: 40 }}
              >
                {bid.bidder.name.charAt(0)}
              </Avatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">
                      {bid.bidder.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" fontWeight="bold">
                      ${bid.amount}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                  </Typography>
                }
              />
            </ListItem>
            {index < bids.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default BidHistory;