importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');

importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({

  apiKey: "AIzaSyABkztOfPBkYFIbvM6P2X2FHgvlC36SfK4",
  authDomain: "wolvesofdelivery-a6e2a.firebaseapp.com",
  projectId: "wolvesofdelivery-a6e2a",
  storageBucket: "wolvesofdelivery-a6e2a.firebasestorage.app",
  messagingSenderId: "888457105343",
  appId: "1:888457105343:web:7a3ae5065b1eacbfa51b0a",
  measurementId: "G-0B10CK4EBL"

});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Mensagem em background recebida:', payload);

  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [1000, 500, 1000, 500, 1000, 500, 1000],
    requireInteraction: true,
    tag: 'nova-corrida',
    renotify: true,
    data: {
      url: '/chamarMotorista'
    }
  };

  //self.registration.showNotification(notificationTitle, notificationOptions);
  self.registration.getNotifications().then((notifications) =>{
    notifications.forEach((notification) => {
      notification.close();
    });
    self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  });
});

self.addEventListener('notificationclick', function(event){
  event.notification.close();
  const urlToOpen = event.notification.data.url;
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});