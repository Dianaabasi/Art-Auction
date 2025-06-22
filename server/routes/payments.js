const express = require('express');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/initialize', auth, async (req, res) => {
  try {
    const { amount, artworkId } = req.body;
    const payment = new Payment({
      user: req.user._id,
      artwork: artworkId,
      amount,
      transactionReference: `PAY-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      paymentMethod: 'paystack'
    });

    await payment.save();
    res.status(201).json({
      authorization_url: `https://checkout.paystack.com/${payment.transactionReference}`,
      reference: payment.transactionReference
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/verify/:reference', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({ transactionReference: req.params.reference });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // In a real implementation, verify with Paystack API
    payment.status = 'completed';
    await payment.save();
    
    res.json({ status: 'success', payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;