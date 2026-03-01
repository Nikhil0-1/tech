// EDUTUG INDIA - Firebase Configuration
// WARNING: Replace these placeholders with your actual Firebase project config before production deployment.

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "edutug-india.firebaseapp.com",
    databaseURL: "https://edutug-india-default-rtdb.firebaseio.com",
    projectId: "edutug-india",
    storageBucket: "edutug-india.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase only if the script is imported in browser
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.database();
    const storage = firebase.storage();
    
    // Make them globally available for vanilla JS
    window.edutugDb = db;
    window.edutugAuth = auth;
    window.edutugStorage = storage;
} else {
    console.error("Firebase SDK script not loaded.");
}
