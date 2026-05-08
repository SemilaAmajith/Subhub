// Firebase Configuration (Compat Version for plain HTML/JS)
// This avoids breaking your existing onclick="" HTML attributes.

const firebaseConfig = {
    apiKey: "AIzaSyAFhl7WR5uwDwhc-FZYpQqcexkqkKtffNY",
    authDomain: "subhubmov.firebaseapp.com",
    projectId: "subhubmov",
    storageBucket: "subhubmov.firebasestorage.app",
    messagingSenderId: "721830381850",
    appId: "1:721830381850:web:44d35a55404ec78464c4a3"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    
    console.log("Firebase Successfully Initialized!");
    
    // Make db globally available for future database functions
    window.db = db;
} else {
    console.error("Firebase SDK not loaded. Please include the Firebase CDN links in your HTML.");
}
