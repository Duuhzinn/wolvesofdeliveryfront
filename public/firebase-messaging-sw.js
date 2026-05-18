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