import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

export const useWebSocket = (auctionId) => {
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io(process.env.REACT_APP_SOCKET_URL);

    if (auctionId) {
      socket.current.emit('join_auction', auctionId);
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [auctionId]);

  const subscribeToBids = (callback) => {
    if (socket.current) {
      socket.current.on('new_bid', callback);
    }
  };

  const emitBid = (bidData) => {
    if (socket.current) {
      socket.current.emit('place_bid', bidData);
    }
  };

  return { subscribeToBids, emitBid };
};