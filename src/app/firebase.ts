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

export const messaging = typeof window !== 'undefined' ? getMessaging(app) : (null as any);
