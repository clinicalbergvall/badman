
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Transaction = require('../models/transaction');
const User = require('../models/User');
const CleanerProfile = require('../models/CleanerProfile');
const IntaSend = require('intasend-node');
const { protect } = require('../middleware/auth');
const { sendNotificationToBookingParticipants, sendNotificationToUser } = require('./events');
let NotificationService;
try {
  NotificationService = require('../src/lib/notificationService');
  console.log('NotificationService loaded successfully in payments');
} catch (error) {
  console.warn('NotificationService not available in payments:', error.message);
  // Create a mock notification service to prevent crashes
  NotificationService = {
    sendPaymentCompletedNotification: async (bookingId, userId) => {
      console.warn(`NotificationService not available. Would send payment completed notification for booking ${bookingId} to user ${userId}`);
      return { success: false, message: 'NotificationService not available' };
    },
    sendPayoutProcessedNotification: async (bookingId, userId) => {
      console.warn(`NotificationService not available. Would send payout processed notification for booking ${bookingId} to user ${userId}`);
      return { success: false, message: 'NotificationService not available' };
    }
  };
}


router.post('/initiate', protect, async (req, res) => {
  console.log('Payment initiate route hit:', req.body);
  try {
    const { bookingId, phoneNumber } = req.body;
    
    
    const booking = await Booking.findOne({
      _id: bookingId,
      client: req.user.id,
      paymentStatus: 'pending'
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or already paid'
      });
    }
    
    
    const intasend = new IntaSend(
      process.env.INTASEND_PUBLIC_KEY,        
      process.env.INTASEND_SECRET_KEY,
      process.env.NODE_ENV !== 'production'
    );
    
    
    const formattedPhone = phoneNumber.replace(/^0/, '254').replace(/^\+/, '');
    
    
    const collection = intasend.collection();
    const response = await collection.mpesaStkPush({
      amount: booking.price,
      phone_number: formattedPhone,
      api_ref: bookingId,
      callback_url: `${process.env.BACKEND_URL || 'https://clean-cloak-b.onrender.com'}/api/payments/webhook`,
      metadata: {
        booking_id: bookingId,
        client_id: req.user.id.toString(),
        service: booking.serviceCategory
      }
    });
    
    console.log('✅ STK Push initiated:', response);
    
    res.json({
      success: true,
      message: 'STK push sent. Check your phone.',
      paymentReference: response.invoice?.invoice_id || response.id,
      tracking_id: response.tracking_id
    });
    
  } catch (error) {
    console.error('❌ Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
});


router.get('/status/:bookingId', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      client: req.user.id
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      paymentStatus: booking.paymentStatus,
      paid: booking.paid,
      paidAt: booking.paidAt,
      transactionId: booking.transactionId
    });
    
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment status'
    });
  }
});


router.post(
  '/webhook',
  express.raw({ type: 'application/json' }), 
  async (req, res) => {
    try {
      const data = JSON.parse(req.body);

      
      if (data.status === 'COMPLETE') {
        const bookingId = data.metadata?.booking_id;

        
        if (!bookingId) {
          console.log('Webhook: No booking_id in metadata');
          return res.json({ success: true });
        }

        const booking = await Booking.findById(bookingId).populate('cleaner');

        if (booking && !booking.paid) {
          
          const pricing = booking.calculatePricing();
          
          
          booking.paid = true;
          booking.paidAt = new Date();
          booking.paymentStatus = 'paid';
          booking.transactionId = data.id || data.transaction_id || '';
          await booking.save();

          
          const paymentTransaction = new Transaction({
            booking: booking._id,
            client: booking.client,
            cleaner: booking.cleaner,
            type: 'payment',
            amount: pricing.totalPrice,
            paymentMethod: booking.paymentMethod,
            transactionId: data.id || data.transaction_id || '',
            reference: `JOB_${booking._id}`,
            description: `Payment for cleaning service - ${booking.serviceCategory}`,
            status: 'completed',
            processedAt: new Date(),
            metadata: {
              intasendData: data,
              split: {
                platformFee: pricing.platformFee,
                cleanerPayout: pricing.cleanerPayout
              }
            }
          });
          await paymentTransaction.save();

          
          await processCleanerPayout(booking, pricing.cleanerPayout);
          
          
          sendNotificationToBookingParticipants(bookingId, 'payment_completed', {
            bookingId: bookingId,
            amount: pricing.totalPrice
          });
          
          
          try {
            if (NotificationService && typeof NotificationService.sendPaymentCompletedNotification === 'function') {
              await NotificationService.sendPaymentCompletedNotification(bookingId, booking.client);
              if (booking.cleaner) {
                await NotificationService.sendPaymentCompletedNotification(bookingId, booking.cleaner);
              }
            }
          } catch (error) {
            console.warn('Failed to send payment completed notification:', error.message);
          }

          console.log(`Payment SUCCESS: KSh ${pricing.totalPrice} for JOB_${bookingId}`);
          console.log(`Platform fee (40%): KSh ${pricing.platformFee}`);
          console.log(`Cleaner payout (60%): KSh ${pricing.cleanerPayout}`);
        } else if (booking?.paid) {
          console.log(`Payment already processed for JOB_${bookingId}`);
        }
      }

      
      res.json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ success: false });
    }
  }
);


async function processCleanerPayout(booking, payoutAmount) {
  try {
    
    const cleanerProfile = await CleanerProfile.findOne({ user: booking.cleaner });
    
    if (!cleanerProfile) {
      throw new Error('Cleaner profile not found');
    }

    
    if (!cleanerProfile.mpesaPhoneNumber) {
      throw new Error('Cleaner M-Pesa phone number not configured');
    }

    
    const payoutTransaction = new Transaction({
      booking: booking._id,
      client: booking.client,
      cleaner: booking.cleaner,
      type: 'payout',
      amount: payoutAmount,
      paymentMethod: 'mpesa',
      transactionId: `PAYOUT_${Date.now()}_${booking._id}`,
      reference: `CLEANER_PAYOUT_JOB_${booking._id}`,
      description: `Cleaner payout for cleaning service - ${booking.serviceCategory}`,
      status: 'pending',
      metadata: {
        mpesaPhone: cleanerProfile.mpesaPhoneNumber
      }
    });
    
    await payoutTransaction.save();
    
    
    booking.payoutStatus = 'pending';
    await booking.save();
    
    
    await processMpesaPayout(payoutTransaction, cleanerProfile.mpesaPhoneNumber, payoutAmount);
    
  } catch (error) {
    console.error('Error processing cleaner payout:', error);
    
    
    const failedTransaction = new Transaction({
      booking: booking._id,
      client: booking.client,
      cleaner: booking.cleaner,
      type: 'payout',
      amount: payoutAmount,
      paymentMethod: 'mpesa',
      transactionId: `FAILED_PAYOUT_${Date.now()}_${booking._id}`,
      reference: `FAILED_CLEANER_PAYOUT_JOB_${booking._id}`,
      description: `Failed cleaner payout for cleaning service - ${booking.serviceCategory}`,
      status: 'failed',
      metadata: {
        error: error.message,
        originalAmount: payoutAmount
      }
    });
    
    await failedTransaction.save();
    
    booking.payoutStatus = 'failed';
    await booking.save();
  }
}


async function processMpesaPayout(transaction, phoneNumber, amount) {
  try {
    
    const client = new IntaSend(
      process.env.INTASEND_PUBLIC_KEY,  
      process.env.INTASEND_SECRET_KEY,
      process.env.NODE_ENV !== 'production'   
    );

    const response = await client.transfer().mpesa({
      amount: amount,
      account: phoneNumber,
      narrative: `Cleaner payout for ${transaction.reference}`,
    });

    if (response.success) {
      
      transaction.status = 'completed';
      transaction.processedAt = new Date();
      transaction.transactionId = response.id;
      transaction.metadata.intasendResponse = response;
      await transaction.save();

      
      const booking = await Booking.findById(transaction.booking);
      booking.payoutStatus = 'processed';
      booking.payoutProcessedAt = new Date();
      await booking.save();
      
      
      sendNotificationToUser(booking.cleaner, 'payout_processed', {
        bookingId: booking._id,
        amount: transaction.amount
      });
      
      
      try {
        if (NotificationService && typeof NotificationService.sendPayoutProcessedNotification === 'function') {
          await NotificationService.sendPayoutProcessedNotification(booking._id, booking.cleaner);
        }
      } catch (error) {
        console.warn('Failed to send payout processed notification:', error.message);
      }

      console.log(`M-Pesa payout SUCCESS: KSh ${amount} to ${phoneNumber}`);
    } else {
      throw new Error(response.message || 'M-Pesa payout failed');
    }

  } catch (error) {
    console.error('M-Pesa payout error:', error);
    
    
    transaction.status = 'failed';
    transaction.metadata.error = error.message;
    await transaction.save();

    
    const booking = await Booking.findById(transaction.booking);
    booking.payoutStatus = 'failed';
    await booking.save();
    
    throw error;
  }
}


router.post('/retry/:bookingId', protect, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      client: req.user.id,
      paymentStatus: 'pending'
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or already paid'
      });
    }
    
    
    const intasend = new IntaSend(
      process.env.INTASEND_PUBLIC_KEY,        
      process.env.INTASEND_SECRET_KEY,
      process.env.NODE_ENV !== 'production'
    );
    
    
    const formattedPhone = phoneNumber.replace(/^0/, '254').replace(/^\+/, '');
    
    
    const collection = intasend.collection();
    const response = await collection.mpesaStkPush({
      amount: booking.price,
      phone_number: formattedPhone,
      api_ref: booking._id,
      callback_url: `${process.env.BACKEND_URL || 'https://clean-cloak-b.onrender.com'}/api/payments/webhook`,
      metadata: {
        booking_id: booking._id.toString(),
        client_id: req.user.id.toString(),
        service: booking.serviceCategory
      }
    });
    
    console.log('✅ STK Push retried:', response);
    
    res.json({
      success: true,
      message: 'STK push resent. Check your phone.',
      paymentReference: response.invoice?.invoice_id || response.id,
      tracking_id: response.tracking_id
    });
    
  } catch (error) {
    console.error('❌ Payment retry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retry payment',
      error: error.message
    });
  }
});

module.exports = router;