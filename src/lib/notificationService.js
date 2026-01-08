const admin = require('firebase-admin');




let serviceAccount;

try {
  
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString());
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    
    serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  }
} catch (error) {
  console.warn('Firebase service account not found. Push notifications will not work.');
  console.warn('Please set FIREBASE_SERVICE_ACCOUNT environment variable with base64 encoded service account JSON');
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
      
      const User = require('../../models/User'); 
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
}

module.exports = NotificationService;