const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Booking = require('../models/Booking');
const ChatRoom = require('../models/ChatRoom');

// Store connected clients
const clients = new Map();

// @route   GET /api/events
// @desc    SSE endpoint for real-time notifications
// @access  Private
router.get('/', protect, (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Disable buffering for nginx
  });

  // Add client to the map
  const clientId = req.user.id;
  clients.set(clientId, res);

  console.log(`📱 SSE client connected: ${clientId} (${req.user.role})`);

  // Send initial connection confirmation
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to notification stream' })}\n\n`);

  // Heartbeat to keep connection alive
  const heartbeatInterval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`);
  }, 30000); // Every 30 seconds

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    clients.delete(clientId);
    console.log(`📱 SSE client disconnected: ${clientId}`);
  });

  // Handle errors
  req.on('error', (err) => {
    console.error(`❌ SSE error for client ${clientId}:`, err);
    clearInterval(heartbeatInterval);
    clients.delete(clientId);
  });
});

// Function to send notification to a specific user
const sendNotificationToUser = (userId, eventType, payload) => {
  const client = clients.get(userId.toString());
  if (client) {
    try {
      client.write(`data: ${JSON.stringify({ type: eventType, payload })}\n\n`);
      console.log(`📤 Notification sent to user ${userId}: ${eventType}`);
    } catch (err) {
      console.error(`❌ Failed to send notification to user ${userId}:`, err);
      clients.delete(userId.toString());
    }
  } else {
    console.log(`📭 No active connection for user ${userId}, notification not sent: ${eventType}`);
  }
};

// Function to send notification to both parties in a booking
const sendNotificationToBookingParticipants = async (bookingId, eventType, payload) => {
  try {
    const booking = await Booking.findById(bookingId).select('client cleaner');
    if (booking) {
      // Notify client
      sendNotificationToUser(booking.client, eventType, { ...payload, bookingId });
      
      // Notify cleaner if assigned
      if (booking.cleaner) {
        sendNotificationToUser(booking.cleaner, eventType, { ...payload, bookingId });
      }
    }
  } catch (err) {
    console.error('❌ Error sending booking notification:', err);
  }
};

// Export functions for use in other routes
module.exports = {
  router,
  sendNotificationToUser,
  sendNotificationToBookingParticipants
};