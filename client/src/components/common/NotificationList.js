import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  IconButton,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Gavel as GavelIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNotifications } from '../../context/NotificationContext';

const getNotificationIcon = (type) => {
  if (!type) return <NotificationsIcon color="primary" />;
  
  switch (type) {
    case 'bid_placed':
    case 'outbid':
    case 'new_bid':
      return <GavelIcon color="primary" />;
    case 'auction_won':
    case 'auction_ended':
      return <CheckCircleIcon color="success" />;
    case 'payment_completed':
    case 'payment_received':
      return <PaymentIcon color="success" />;
    case 'artwork_approved':
      return <CheckCircleIcon color="success" />;
    case 'artwork_rejected':
      return <CancelIcon color="error" />;
    case 'auction_ending_soon':
      return <InfoIcon color="warning" />;
    default:
      return <NotificationsIcon color="primary" />;
  }
};

const getNotificationColor = (type) => {
  if (!type) return 'default';
  
  switch (type) {
    case 'bid_placed':
    case 'outbid':
    case 'new_bid':
      return 'primary';
    case 'auction_won':
    case 'auction_ended':
    case 'payment_completed':
    case 'payment_received':
    case 'artwork_approved':
      return 'success';
    case 'artwork_rejected':
      return 'error';
    case 'auction_ending_soon':
      return 'warning';
    default:
      return 'default';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown time';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const NotificationList = ({ notifications, onMarkAsRead, onDelete, loading }) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [actionLoading, setActionLoading] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({ open: false, notificationId: null, message: '' });
  

  
  const handleMarkAsRead = async (notificationId) => {
    if (!notificationId) {
      setSnackbar({ open: true, message: 'Invalid notification ID', severity: 'error' });
      return;
    }
    
    setActionLoading(prev => ({ ...prev, [`mark-${notificationId}`]: true }));
    
    try {
      await onMarkAsRead(notificationId);
      setSnackbar({ open: true, message: 'Notification marked as read', severity: 'success' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setSnackbar({ open: true, message: 'Failed to mark notification as read', severity: 'error' });
    } finally {
      setActionLoading(prev => ({ ...prev, [`mark-${notificationId}`]: false }));
    }
  };
  
  const handleDeleteClick = (notificationId, message) => {
    if (!notificationId) {
      setSnackbar({ open: true, message: 'Invalid notification ID', severity: 'error' });
      return;
    }
    
    setDeleteDialog({ open: true, notificationId, message });
  };
  
  const handleDeleteConfirm = async () => {
    const { notificationId } = deleteDialog;
    
    setActionLoading(prev => ({ ...prev, [`delete-${notificationId}`]: true }));
    setDeleteDialog({ open: false, notificationId: null, message: '' });
    
    try {
      await onDelete(notificationId);
      setSnackbar({ open: true, message: 'Notification deleted', severity: 'success' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      setSnackbar({ open: true, message: 'Failed to delete notification', severity: 'error' });
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${notificationId}`]: false }));
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, notificationId: null, message: '' });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Box p={2} textAlign="center">
        <Typography variant="body2" color="textSecondary">
          No notifications
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {notifications.filter(notification => notification && typeof notification === 'object').map((notification, index) => (
          <React.Fragment key={notification._id || `notification-${index}`}>
            <ListItem
              alignItems="flex-start"
              sx={{
                backgroundColor: (notification.isRead === true) ? 'transparent' : 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.selected'
                }
              }}
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      sx={{ fontWeight: (notification.isRead === true) ? 'normal' : 'bold' }}
                    >
                      {notification.message || 'No message'}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={notification.type ? notification.type.replace('_', ' ') : 'Notification'}
                        size="small"
                        color={getNotificationColor(notification.type)}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="textSecondary">
                        {notification.createdAt ? formatDate(notification.createdAt) : 'Unknown time'}
                      </Typography>
                    </Box>
                  </Box>
                }
                secondary={
                  <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="textSecondary">
                      {notification.relatedArtwork?.title && `Artwork: ${notification.relatedArtwork.title}`}
                    </Typography>
                    <Box>
                                          {notification.isRead !== true && (
                      <Tooltip title="Mark as read">
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(notification._id || '')}
                          color="primary"
                          disabled={actionLoading[`mark-${notification._id}`]}
                        >
                          {actionLoading[`mark-${notification._id}`] ? (
                            <CircularProgress size={16} />
                          ) : (
                            <CheckCircleIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete notification">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(notification._id || '', notification.message || '')}
                        color="error"
                        disabled={actionLoading[`delete-${notification._id}`]}
                      >
                        {actionLoading[`delete-${notification._id}`] ? (
                          <CircularProgress size={16} />
                        ) : (
                          <DeleteIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    </Box>
                  </Box>
                }
              />
            </ListItem>
            {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-notification-dialog-title"
      >
        <DialogTitle id="delete-notification-dialog-title">
          Delete Notification
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this notification?
          </Typography>
          {deleteDialog.message && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              "{deleteDialog.message}"
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={actionLoading[`delete-${deleteDialog.notificationId}`]}
          >
            {actionLoading[`delete-${deleteDialog.notificationId}`] ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationList; 