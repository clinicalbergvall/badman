# Push Notifications Setup for CleanCloak App

## Overview
This document describes the implementation of push notifications for the CleanCloak app. The system provides both in-app notifications (via Server-Sent Events) and push notifications that work even when the app is closed.

## Architecture

### Frontend (React/Capacitor)
- **Push Notification Service**: `src/lib/pushNotifications.js` handles registration and receiving notifications
- **Automatic Registration**: The app registers for push notifications when it starts (in `src/AppEnhanced.tsx`)
- **Token Management**: Device tokens are automatically sent to the backend when received

### Backend (Node.js/Express)
- **Notification Service**: `src/lib/notificationService.js` handles sending push notifications via Firebase Cloud Messaging (FCM)
- **User Model**: Extended with `deviceTokens` array to store device tokens
- **API Endpoint**: `/api/users/device-token` to save device tokens from frontend
- **Event Integration**: Push notifications are sent for booking events in `routes/bookings.js` and `routes/payments.js`

## Features Implemented

### 1. Automatic Registration
- App requests push notification permission when launched
- Automatically registers with FCM when permission is granted
- Stores device tokens in user account

### 2. Event-Based Notifications
The system sends push notifications for:
- **Booking Created**: When a new booking is created
- **Booking Accepted**: When a cleaner accepts a booking
- **Booking Completed**: When a booking is marked as completed
- **Payment Completed**: When payment is processed
- **Payout Processed**: When cleaner receives payout

### 3. Cross-Platform Support
- Works on both Android and iOS
- Uses Capacitor's push notification plugin for native integration

## Setup Instructions

### 1. Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Firebase Cloud Messaging
4. Get your Server Key from Project Settings > Cloud Messaging

### 2. Firebase Service Account
1. Go to Project Settings > Service Accounts
2. Generate a new private key (JSON file)
3. Encode the JSON content as base64
4. Set the `FIREBASE_SERVICE_ACCOUNT` environment variable with the base64 encoded content

### 3. Android Configuration
1. Download `google-services.json` from Firebase Console
2. Place it in `android/app/` directory
3. Ensure your `android/app/build.gradle` has the required Firebase dependencies (already configured)

### 4. iOS Configuration
1. Configure APNs certificates in Firebase Console
2. Capacitor handles iOS configuration automatically

## Environment Variables
```bash
# Base64 encoded Firebase service account JSON
FIREBASE_SERVICE_ACCOUNT=your_base64_encoded_service_account_json
```

## API Endpoints

### POST /api/users/device-token
**Purpose**: Save device token for push notifications
**Headers**: 
- `Authorization: Bearer <JWT_TOKEN>`
- `Content-Type: application/json`
**Body**:
```json
{
  "deviceToken": "your_device_token_here"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Device token saved successfully"
}
```

## Testing Push Notifications

1. **Build the app**:
   ```bash
   npm run build
   npx cap sync
   ```

2. **Run on device/emulator**:
   ```bash
   npx cap run android
   # or
   npx cap run ios
   ```

3. **Test functionality**:
   - Open the app and allow notification permissions
   - Create a booking while the app is in the background/closed
   - You should receive push notifications when booking status changes

## Error Handling
- If Firebase Admin SDK is not initialized, the system logs warnings but continues to function
- Device tokens are only stored if they don't already exist for the user
- Errors during notification sending are logged but don't break the main flow

## Troubleshooting

### Common Issues
1. **"Cannot find module '@capacitor/push-notifications'"**:
   - Run: `npm install @capacitor/push-notifications`

2. **Notifications not appearing**:
   - Verify Firebase project setup
   - Check that device tokens are being saved in the database
   - Ensure environment variables are properly set

3. **Permission denied**:
   - On Android 13+, users must explicitly grant notification permissions
   - The app requests permission automatically when launched

### Debugging
- Check browser console for registration errors
- Verify device tokens are stored in the database
- Check Firebase Console for message delivery status
- Review server logs for notification sending errors

## Security Considerations
- Device tokens are stored securely in the user's document
- All API endpoints are protected with JWT authentication
- Firebase Admin SDK uses service account credentials for server-side operations

## Future Enhancements
- Topic-based notifications for general announcements
- Rich notifications with images and actions
- Notification preferences per user
- Analytics tracking for notification engagement