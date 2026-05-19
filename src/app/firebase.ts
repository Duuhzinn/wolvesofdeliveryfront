import { initializeApp } from 'firebase/app';

import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyABkztOfPBkYFIbvM6P2X2FHgvlC36SfK4',
  authDomain: 'wolvesofdelivery-a6e2a.firebaseapp.com',
  projectId: 'wolvesofdelivery-a6e2a',
  storageBucket: 'wolvesofdelivery-a6e2a.firebasestorage.app',
  messagingSenderId: '888457105343',
  appId: '1:888457105343:web:7a3ae5065b1eacbfa51b0a',
  measurementId: 'G-0B10CK4EBL',
};

const app = initializeApp(firebaseConfig);

// REGISTRA O SERVICE WORKER
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registrado:', registration);
    })
    .catch((err) => {
      console.error('Erro ao registrar Service Worker:', err);
    });
}

export const messaging = typeof window !== 'undefined' ? getMessaging(app) : (null as any);
