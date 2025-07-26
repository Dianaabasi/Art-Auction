import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

// Get tab-specific storage key
const getStorageKey = (key) => {
  const tabId = sessionStorage.getItem('tabId') || `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  if (!sessionStorage.getItem('tabId')) {
    sessionStorage.setItem('tabId', tabId);
  }
  return `${key}_${tabId}`;
};

// Artwork related endpoints
export const getAllArtworks = async () => {
  const response = await axios.get(`${API_URL}/api/artworks`);
  return response.data;
};

export const getMyArtworks = async () => {
  const response = await axios.get(`${API_URL}/api/artworks/my-artworks`, {
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem(getStorageKey('token'))}`
    }
  });
  return response.data;
};

export const getAuctionById = async (id) => {
  const response = await axios.get(`${API_URL}/api/auctions/${id}`);
  return response.data;
};

export const getArtworkById = async (id) => {
  const response = await axios.get(`${API_URL}/api/artworks/${id}`);
  return response.data;
};

export const updateArtwork = async (id, data) => {
  const response = await axios.put(`${API_URL}/api/artworks/${id}`, data, {
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem(getStorageKey('token'))}`
    }
  });
  return response.data;
};

export const cancelAuction = async (id) => {
  const response = await axios.delete(`${API_URL}/api/artworks/${id}`, {
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem(getStorageKey('token'))}`
    }
  });
  return response.data;
};

export const deleteArtwork = async (id) => {
  const response = await axios.delete(`${API_URL}/api/artworks/${id}`, {
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem(getStorageKey('token'))}`
    }
  });
  return response.data;
};

export const placeBid = async (artworkId, bidData) => {
  const response = await axios.post(
    `${API_URL}/api/bids/${artworkId}`,
    bidData,
    {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem(getStorageKey('token'))}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

// Admin related endpoints
export const getAdminStats = async () => {
  const response = await axios.get(`${API_URL}/admin/stats`);
  return response.data;
};

export const getUsers = async () => {
  const response = await axios.get(`${API_URL}/admin/users`);
  return response.data;
};

export const getAuctions = async () => {
  const response = await axios.get(`${API_URL}/admin/auctions`);
  return response.data;
};

export const createArtwork = async (data) => {
  const response = await axios.post(`${API_URL}/api/artworks`, data, {
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem(getStorageKey('token'))}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Auction and Bidding APIs
// Fix the getAuthHeader function to return the complete config object
const getAuthHeader = () => {
  const token = sessionStorage.getItem(getStorageKey('token'));
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Update the startAuction function
export const startAuction = async (artworkId, { duration }) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/artworks/${artworkId}/auction`,
      { duration },
      {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem(getStorageKey('token'))}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getArtworkBids = async (artworkId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/bids/artwork/${artworkId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Profile management endpoints
export const getProfile = async () => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(getStorageKey('token'))}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch profile' };
  }
};

export const updateProfile = async (formData) => {
  try {
    const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/profile`, formData, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem(getStorageKey('token'))}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update profile' };
  }
};

// Bid history endpoints
export const getUserBids = async () => {
  const response = await axios.get(`${API_URL}/api/users/bids`, {
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem(getStorageKey('token'))}`
    }
  });
  return response.data;
};

export const endAuction = async (id) => {
  const response = await axios.post(`${API_URL}/api/artworks/${id}/end`, {}, {
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem(getStorageKey('token'))}`
    }
  });
  return response.data;
};

// Admin user management endpoints
export const getAllUsers = async (params = {}) => {
  const token = sessionStorage.getItem(getStorageKey('token'));
  const response = await axios.get(`${API_URL}/api/users`, {
    headers: { 'Authorization': `Bearer ${token}` },
    params
  });
  return response.data;
};

export const updateUserRole = async (userId, role) => {
  const token = sessionStorage.getItem(getStorageKey('token'));
  const response = await axios.put(
    `${API_URL}/api/users/${userId}/role`,
    { role },
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

export const banUser = async (userId, banned) => {
  const token = sessionStorage.getItem(getStorageKey('token'));
  const response = await axios.put(
    `${API_URL}/api/users/${userId}/ban`,
    { banned },
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

// Admin artwork management endpoints
export const getAllArtworksAdmin = async (params = {}) => {
  const token = sessionStorage.getItem(getStorageKey('token'));
  const response = await axios.get(`${API_URL}/api/artworks`, {
    headers: { 'Authorization': `Bearer ${token}` },
    params
  });
  return response.data;
};

export const approveArtwork = async (artworkId) => {
  const token = sessionStorage.getItem(getStorageKey('token'));
  const response = await axios.put(
    `${API_URL}/api/artworks/${artworkId}/approve`,
    {},
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

export const rejectArtwork = async (artworkId) => {
  const token = sessionStorage.getItem(getStorageKey('token'));
  const response = await axios.put(
    `${API_URL}/api/artworks/${artworkId}/reject`,
    {},
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

export const removeArtwork = async (artworkId) => {
  const token = sessionStorage.getItem(getStorageKey('token'));
  const response = await axios.delete(
    `${API_URL}/api/artworks/${artworkId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

// Admin bid analytics endpoints
export const getBidAnalyticsAdmin = async () => {
  const token = sessionStorage.getItem(getStorageKey('token'));
  const response = await axios.get(`${API_URL}/api/bids/analytics`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

export const getAllBidsAdmin = async (params = {}) => {
  const token = sessionStorage.getItem(getStorageKey('token'));
  const response = await axios.get(`${API_URL}/api/bids`, {
    headers: { 'Authorization': `Bearer ${token}` },
    params
  });
  return response.data;
};

export const initializePayment = async (amount, artworkId) => {
  const token = sessionStorage.getItem(getStorageKey('token'));
  const response = await axios.post(
    `${API_URL}/api/payments/initialize`,
    { amount, artworkId },
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

export const verifyPayment = async (reference) => {
  const token = sessionStorage.getItem(getStorageKey('token'));
  const response = await axios.get(
    `${API_URL}/api/payments/verify/${reference}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

export const updateArtistPayoutMethod = async (payoutMethod) => {
  const token = sessionStorage.getItem(getStorageKey('token'));
  const response = await axios.put(
    `${API_URL}/api/payments/artist-method`,
    { payoutMethod },
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};


// Helper functions for API calls
const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    throw error.response.data;
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    throw new Error('No response from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    throw error;
  }
};