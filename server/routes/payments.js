const express = require('express');
const Payment = require('../models/Payment');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();
const axios = require('axios');

// Initialize payment (Paystack)
router.post('/initialize', auth, async (req, res) => {
  try {
    const { amount, artworkId } = req.body;
    const user = await User.findById(req.user._id);
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const paystackCallback = `${process.env.CLIENT_URL}/payment/callback`;
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: user.email,
        amount: amount * 100, // Paystack expects kobo
        callback_url: paystackCallback,
        metadata: { artworkId }
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json'
        }
      }
    );
    // Save payment record (pending)
    await Payment.create({
      user: req.user._id,
      artwork: artworkId,
      amount,
      transactionReference: response.data.data.reference,
      paymentMethod: 'paystack',
      status: 'pending'
    });
    res.status(201).json({
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference
    });
  } catch (error) {
    res.status(400).json({ error: error.response?.data?.message || error.message });
  }
});

// Verify payment (Paystack)
router.get('/verify/:reference', auth, async (req, res) => {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${req.params.reference}`,
      {
        headers: { Authorization: `Bearer ${paystackSecret}` }
      }
    );
    const payment = await Payment.findOneAndUpdate(
      { transactionReference: req.params.reference },
      { status: response.data.data.status === 'success' ? 'completed' : 'failed' },
      { new: true }
    );
    res.json({ status: payment.status, payment });
  } catch (error) {
    res.status(400).json({ error: error.response?.data?.message || error.message });
  }
});

// Artist: Add/update payout method
router.put('/artist-method', auth, async (req, res) => {
  try {
    const { payoutMethod } = req.body; // e.g., bank account info
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { payoutMethod },
      { new: true }
    );
    res.json({ message: 'Payout method updated', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;