// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDJuOyH28IOxkwv0z_t8zDM8x9QHekmcbo",
    authDomain: "quiz-maker-564de.firebaseapp.com",
    projectId: "quiz-maker-564de",
    storageBucket: "quiz-maker-564de.firebasestorage.app",
    messagingSenderId: "159132825045",
    appId: "1:159132825045:web:b62127732f4e1c7dccf95c",
    measurementId: "G-EWY14DWNMJ"
};

// Initialize Firebase using the Compat CDN
firebase.initializeApp(firebaseConfig);

// Initialize Services
const auth = firebase.auth();
const db = firebase.firestore();
