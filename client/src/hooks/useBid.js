import { useState } from 'react';
import { placeBid } from '../services/api';
import { useWebSocket } from './useWebSocket';

export const useBid = (auctionId) => {
  const [bidding, setBidding] = useState(false);
  const [error, setError] = useState(null);
  const { emitBid } = useWebSocket(auctionId);

  const submitBid = async (amount) => {
    setBidding(true);
    setError(null);
    try {
      const response = await placeBid(auctionId, amount);
      emitBid({ auctionId, amount });
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setBidding(false);
    }
  };

  return { submitBid, bidding, error };
};