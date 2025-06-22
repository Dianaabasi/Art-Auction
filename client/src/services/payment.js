import axios from 'axios';

const PAYMENT_API = `${process.env.REACT_APP_API_URL}/payments`;

export const initiatePayment = async (paymentData) => {
  const response = await axios.post(`${PAYMENT_API}/initialize`, paymentData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

export const verifyPayment = async (reference) => {
  const response = await axios.get(`${PAYMENT_API}/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};