
import { logger } from './logger';

const getCapacitor = async () => {
  try {
    // @ts-ignore
    const capacitorModule = await import('@capacitor/core');
    return capacitorModule.Capacitor;
  } catch (error) {
    console.warn('Capacitor not available in this environment:', error);

    return {
      isNativePlatform: () => false,
    };
  }
};

export class PushNotificationService {
  static async requestPermission() {
    try {
      const Capacitor = await getCapacitor();


      if (!Capacitor.isNativePlatform()) {
        console.log('Push notifications only available on native platforms');
        return false;
      }


      let PushNotifications: any;
      try {
        // @ts-ignore
        const pushModule = await import('@capacitor/push-notifications');
        PushNotifications = pushModule.PushNotifications;
      } catch (importError) {
        console.warn('Push notifications module not available:', importError);
        return false;
      }

      const permission = await PushNotifications.requestPermissions();
      return permission.receive === 'granted';
    } catch (error) {
      logger.error('Error requesting push notification permission', error instanceof Error ? error : undefined, { eventId: 'push-permission-error' });
      return false;
    }
  }

  static async registerForNotifications() {
    try {
      const Capacitor = await getCapacitor();


      if (!Capacitor.isNativePlatform()) {
        console.log('Push notifications only available on native platforms');
        return;
      }

      console.log('Starting push notification registration...');

      // Wait a bit more to ensure Capacitor is fully initialized
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      let PushNotifications: any;
      try {
        // @ts-ignore
        const pushModule = await import('@capacitor/push-notifications');
        PushNotifications = pushModule.PushNotifications;
        console.log('Push notifications module imported successfully');
      } catch (importError) {
        console.warn('Push notifications module not available:', importError);
        return;
      }

      // Request permission before registering
      const permissionGranted = await this.requestPermission();

      if (!permissionGranted) {
        logger.warn('Push notification permission denied by user');
        console.warn('Push notification permission denied by user');
        return;
      }

      console.log('Push notification permission granted, registering...');

      // Register for push notifications
      await PushNotifications.register();

      console.log('Push notifications registered, setting up listeners...');

      // Set up event listeners
      PushNotifications.addListener('registration', (token: any) => {
        logger.info('Push registration success, token:', token.value);
        console.log('Push registration success, token:', token.value);
        this.sendTokenToBackend(token.value);
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        logger.error('Error on registration:', error);
        console.error('Push registration error:', error);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
        logger.info('Push received: ', notification);
        console.log('Push notification received:', notification.title || notification.body);
        this.handleForegroundNotification(notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification: any) => {
        logger.info('Push action performed: ', notification);
        console.log('Push notification action performed:', notification.title || notification.data?.title);
        this.handleNotificationTap(notification);
      });

      console.log('Push notification listeners set up successfully');
    } catch (error) {
      logger.error('Error registering for push notifications', error instanceof Error ? error : undefined, { eventId: 'push-registration-error' });
      console.error('Error registering for push notifications:', error);
    }
  }

  static async sendTokenToBackend(token: any) {
    try {


      const response = await fetch('/api/users/device-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ deviceToken: token })
      });

      if (!response.ok) {
        logger.error('Failed to send push token to backend', undefined, { eventId: 'token-upload-error' });
      } else {
        logger.info('Push token sent to backend successfully');
      }
    } catch (error) {
      logger.error('Error sending push token to backend', error instanceof Error ? error : undefined, { eventId: 'token-send-error' });
    }
  }

  static async getDeliveredNotifications() {
    try {
      const Capacitor = await getCapacitor();


      if (!Capacitor.isNativePlatform()) {
        console.log('Push notifications only available on native platforms');
        return [];
      }


      let PushNotifications: any;
      try {
        // @ts-ignore
        const pushModule = await import('@capacitor/push-notifications');
        PushNotifications = pushModule.PushNotifications;
      } catch (importError) {
        console.warn('Push notifications module not available:', importError);
        return [];
      }

      const notifications = await PushNotifications.getDeliveredNotifications();
      return notifications;
    } catch (error) {
      logger.error('Error getting delivered notifications', error instanceof Error ? error : undefined, { eventId: 'delivered-notifications-error' });
      return [];
    }
  }

  static async removeDeliveredNotifications(notifications: any) {
    try {
      const Capacitor = await getCapacitor();


      if (!Capacitor.isNativePlatform()) {
        console.log('Push notifications only available on native platforms');
        return;
      }


      let PushNotifications: any;
      try {
        // @ts-ignore
        const pushModule = await import('@capacitor/push-notifications');
        PushNotifications = pushModule.PushNotifications;
      } catch (importError) {
        console.warn('Push notifications module not available:', importError);
        return;
      }

      await PushNotifications.removeDeliveredNotifications(notifications);
    } catch (error) {
      logger.error('Error removing delivered notifications', error instanceof Error ? error : undefined, { eventId: 'remove-notifications-error' });
    }
  }

  static async removeAllDeliveredNotifications() {
    try {
      const Capacitor = await getCapacitor();


      if (!Capacitor.isNativePlatform()) {
        console.log('Push notifications only available on native platforms');
        return;
      }


      let PushNotifications: any;
      try {
        // @ts-ignore
        const pushModule = await import('@capacitor/push-notifications');
        PushNotifications = pushModule.PushNotifications;
      } catch (importError) {
        console.warn('Push notifications module not available:', importError);
        return;
      }

      await PushNotifications.removeAllDeliveredNotifications();
    } catch (error) {
      logger.error('Error removing all delivered notifications', error instanceof Error ? error : undefined, { eventId: 'remove-all-notifications-error' });
    }
  }

  static handleForegroundNotification(notification: any) {


    console.log('Foreground notification received:', notification);
  }

  static handleNotificationTap(notification: any) {


    console.log('Notification tapped:', notification);
    if (notification.data && notification.data.bookingId) {

      window.location.href = `/active-booking/${notification.data.bookingId}`;
    }
  }
}
