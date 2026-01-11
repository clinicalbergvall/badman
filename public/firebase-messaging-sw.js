// Give the service worker access to Firebase Messaging.
self.addEventListener('push', function(event) {
  if (!event.data) {
    return;
  }

  const payload = event.data.json();
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: payload.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification click received: ', event);

  event.notification.close();

  // This assumes you want to open the app when clicking the notification
  event.waitUntil(
    clients.openWindow(event.notification.data?.click_action || '/')
  );
});

// Import Firebase Messaging if not already available
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in service worker
firebase.initializeApp({
    apiKey: "AIzaSyDB0K6AJBg3xciuO6XKHWYQCYgsg8U3nOo",
    authDomain: "cloaked-34fcb.firebaseapp.com",
    projectId: "cloaked-34fcb",
    storageBucket: "cloaked-34fcb.firebasestorage.app",
    messagingSenderId: "545399376048",
    appId: "1:545399376048:web:988d4d82db620e44a11375",
    measurementId: "G-N9P6N7T1BV"
});