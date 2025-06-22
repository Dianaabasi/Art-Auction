import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';

export const AuctionContext = createContext(null);

export const AuctionProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [activeAuctions, setActiveAuctions] = useState({});
  
  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_API_URL);
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);
  
  useEffect(() => {
    if (!socket) return;
    
    // Listen for bid updates
    socket.on('bid-placed', (data) => {
      setActiveAuctions(prev => ({
        ...prev,
        [data.artworkId]: {
          currentBid: data.amount,
          bidder: data.bidder,
          timestamp: data.timestamp
        }
      }));
    });
    
    // Listen for auction status changes
    socket.on('auction-status-change', (data) => {
      setActiveAuctions(prev => {
        const updated = { ...prev };
        if (data.status === 'ended') {
          delete updated[data.artworkId];
        }
        return updated;
      });
    });
    
    return () => {
      socket.off('bid-placed');
      socket.off('auction-status-change');
    };
  }, [socket]);
  
  const joinAuctionRoom = (artworkId) => {
    if (socket) {
      socket.emit('join-auction', { artworkId });
    }
  };
  
  const leaveAuctionRoom = (artworkId) => {
    if (socket) {
      socket.emit('leave-auction', { artworkId });
    }
  };
  
  return (
    <AuctionContext.Provider value={{ 
      activeAuctions,
      joinAuctionRoom,
      leaveAuctionRoom
    }}>
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => useContext(AuctionContext);