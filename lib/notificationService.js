let admin;
try {
  admin = require('firebase-admin');
} catch (error) {
  console.warn('Firebase Admin SDK not available. Push notifications will not work.');
  console.warn('Install firebase-admin: npm install firebase-admin');
  // Create a mock admin object to prevent crashes
  admin = {
    apps: [],
    messaging: () => ({
      sendMulticast: async () => {
        console.warn('Firebase Admin not available. Skipping push notification.');
        return { success: false, message: 'Firebase Admin not available' };
      }
    }),
    initializeApp: () => {},
    credential: {
      cert: () => {}
    }
  };
}


let serviceAccount;

// Try different methods to initialize Firebase Admin SDK
try {
  // Method 1: Use base64 encoded service account JSON
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString());
  } 
  // Method 2: Use direct environment variables (recommended for your setup)
  else if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    serviceAccount = {
      "type": "service_account",
      "project_id": process.env.FIREBASE_PROJECT_ID,
      "private_key_id": "",
      "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      "client_email": process.env.FIREBASE_CLIENT_EMAIL,
      "client_id": "",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": ""
    };
  } 
  // Method 3: Use Google Application Credentials file
  else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  }
} catch (error) {
  console.warn('Firebase service account not found. Push notifications will not work.');
  console.warn('Please set FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL environment variables');
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

class NotificationService {
  static async sendPushNotification(deviceTokens, title, body, data = {}) {
    if (!admin.apps.length) {
      console.warn('Firebase Admin not initialized. Skipping push notification.');
      return { success: false, message: 'Firebase Admin not initialized' };
    }

    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          timestamp: Date.now().toString()
        },
        tokens: Array.isArray(deviceTokens) ? deviceTokens : [deviceTokens]
      };

      const response = await admin.messaging().sendMulticast(message);
      
      console.log('Push notification sent successfully:', response);
      
      return {
        success: true,
        response
      };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  static async sendBookingNotification(bookingId, userId, notificationType, title, body) {
    try {
      
      const User = require('../models/User'); 
      const user = await User.findById(userId);
      
      if (!user || !user.deviceTokens || user.deviceTokens.length === 0) {
        console.log(`No device tokens found for user ${userId}`);
        return { success: false, message: 'No device tokens found for user' };
      }

      
      const result = await this.sendPushNotification(
        user.deviceTokens,
        title,
        body,
        {
          bookingId: bookingId.toString(),
          type: notificationType
        }
      );

      return result;
    } catch (error) {
      console.error('Error sending booking notification:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendBookingCreatedNotification(bookingId, userId) {
    return await this.sendBookingNotification(
      bookingId,
      userId,
      'booking_created',
      'New Booking',
      'Your booking has been created successfully.'
    );
  }

  static async sendBookingAcceptedNotification(bookingId, userId) {
    return await this.sendBookingNotification(
      bookingId,
      userId,
      'booking_accepted',
      'Booking Accepted',
      'Your booking has been accepted by a cleaner.'
    );
  }

  static async sendBookingCompletedNotification(bookingId, userId) {
    return await this.sendBookingNotification(
      bookingId,
      userId,
      'booking_completed',
      'Job Completed',
      'Your booking has been marked as completed.'
    );
  }

  static async sendPaymentCompletedNotification(bookingId, userId) {
    return await this.sendBookingNotification(
      bookingId,
      userId,
      'payment_completed',
      'Payment Received',
      'Payment for your booking has been processed.'
    );
  }

  static async sendPayoutProcessedNotification(bookingId, userId) {
    return await this.sendBookingNotification(
      bookingId,
      userId,
      'payout_processed',
      'Payout Sent',
      'Your payout for the booking has been processed.'
    );
  }

  static async sendChatMessageNotification(bookingId, userId, senderName, messageText) {
    return await this.sendBookingNotification(
      bookingId,
      userId,
      'newMessage',
      `New Message from ${senderName}`,
      messageText.length > 50 ? messageText.substring(0, 47) + '...' : messageText
    );
  }
}

module.exports = NotificationService;