// Firebase Cloud Messaging Background Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDemoKeyForPreviewEnvironmentOnly",
  authDomain: "digital-clinic-app.firebaseapp.com",
  projectId: "digital-clinic-app",
  storageBucket: "digital-clinic-app.appspot.com",
  messagingSenderId: "1029384756",
  appId: "1:1029384756:web:abcd1234efgh"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  const notificationTitle = payload.notification?.title || 'Digital Clinic Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a queue or appointment update.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'digital-clinic-queue'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
