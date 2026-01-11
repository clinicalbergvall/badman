

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

// Capacitor HTTP plugin type definitions
interface CapacitorHttpRequest {
  url: string;
  method: string;
  headers?: any;
  data?: any;
}

interface CapacitorHttpResponse {
  status: { code: number; text: string } | number;
  headers?: any;
  data: any;
}

interface CapacitorHttpPlugin {
  request(options: CapacitorHttpRequest): Promise<CapacitorHttpResponse>;
}

declare module '@capacitor/http' {
  export const Http: CapacitorHttpPlugin;
}

// Capacitor HTTP plugin type definitions
interface CapacitorHttpRequest {
  url: string;
  method: string;
  headers?: any;
  data?: any;
}

interface CapacitorHttpResponse {
  status: { code: number; text: string } | number;
  headers?: any;
  data: any;
}

interface CapacitorHttpPlugin {
  request(options: CapacitorHttpRequest): Promise<CapacitorHttpResponse>;
}

declare module '@capacitor/http' {
  export const Http: CapacitorHttpPlugin;
}