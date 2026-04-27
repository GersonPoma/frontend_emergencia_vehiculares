importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCfR-CBfloYqS9w3ZGsKZoi3USgeSTa2SM",
  authDomain: "emergencias-vehiculares-app.firebaseapp.com",
  projectId: "emergencias-vehiculares-app",
  storageBucket: "emergencias-vehiculares-app.firebasestorage.app",
  messagingSenderId: "318737587315",
  appId: "1:318737587315:web:05199f12b573816585de06"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log('[SW] payload completo:', JSON.stringify(payload));
  const title = payload.data?.titulo ?? 'Nueva emergencia';
  const body = payload.data?.cuerpo ?? '';

  self.registration.showNotification(title, {
    body,
    icon: '/assets/images/logos/favicon.ico',
  });
});
