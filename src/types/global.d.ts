

declare module './lib/pushNotifications' {
  export class PushNotificationService {
    static requestPermission(): Promise<boolean>;
    static registerForNotifications(): Promise<void>;
    static sendTokenToBackend(token: string): Promise<void>;
    static getDeliveredNotifications(): Promise<any[]>;
    static removeDeliveredNotifications(notifications: string[]): Promise<void>;
    static removeAllDeliveredNotifications(): Promise<void>;
    static handleForegroundNotification(notification: any): void;
    static handleNotificationTap(notification: any): void;
  }
}


interface Window {
  Capacitor?: any;
  toast?: any;
}