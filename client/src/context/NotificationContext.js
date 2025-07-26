import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { onNotification, joinUserRoom, leaveUserRoom } from '../services/websocket';
import * as notificationService from '../services/notification';

export const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
  deleteNotification: () => {},
  fetchNotifications: () => {},
  fetchUnreadCount: () => {},
});

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Add notification (for real-time updates)
  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }
    
    try {
      const updatedNotification = await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return updatedNotification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Clear all notifications
  const clearNotifications = async () => {
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Delete single notification
  const deleteNotification = async (notificationId) => {
    if (!notificationId) {
      throw new Error('Notification ID is required');
    }
    
    try {
      const deletedNotification = notifications.find(n => n._id === notificationId);
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter(n => n._id !== notificationId));
      // Update unread count if the deleted notification was unread
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      return deletedNotification;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  };

  // Handle real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Join user room for notifications
    joinUserRoom(user._id);

    // Listen for real-time notifications
    const handleNotification = (notification) => {
      addNotification(notification);
    };

    onNotification(handleNotification);

    // Fetch initial notifications
    fetchNotifications();
    fetchUnreadCount();

    // Cleanup
    return () => {
      leaveUserRoom(user._id);
    };
  }, [isAuthenticated, user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        deleteNotification,
        fetchNotifications,
        fetchUnreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);