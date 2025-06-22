import { useState } from 'react';
import { initiatePayment, verifyPayment } from '../services/payment';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processPayment = async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await initiatePayment(paymentData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyTransaction = async (reference) => {
    try {
      const response = await verifyPayment(reference);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { processPayment, verifyTransaction, loading, error };
};