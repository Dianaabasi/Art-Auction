import React from 'react';
import { List, ListItem, ListItemText, Typography, Divider, Box } from '@mui/material';

const BidHistory = ({ bids = [] }) => {
  if (!bids || bids.length === 0) {
    return <Typography>No bids placed yet. Be the first to bid!</Typography>;
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Bid History ({bids.length})</Typography>
      <List>
        {bids.map((bid, index) => (
          <React.Fragment key={bid._id || index}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <>
                    <Typography component="span" variant="body1" fontWeight="bold">
                      {bid.bidder?.name || 'Anonymous'}
                    </Typography>
                    {bid.amount !== undefined && (
                      <Typography component="span" variant="body1" sx={{ ml: 2 }} color="primary">
                        ₦{bid.amount}
                      </Typography>
                    )}
                  </>
                }
                secondary={
                  <Typography component="span" variant="body2" color="text.secondary">
                    {bid.createdAt ? new Date(bid.createdAt).toLocaleString() : ''}
                  </Typography>
                }
              />
            </ListItem>
            {index < bids.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default BidHistory;