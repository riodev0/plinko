// Firebase Initialization (add to all games)
const firebaseConfig = {
  apiKey: "AIzaSyDfK_HayFBawYzgIcGXQsQ4ynyCrVHHL8A",
  authDomain: "tbgames-d6995.firebaseapp.com",
  projectId: "tbgames-d6995",
  storageBucket: "tbgames-d6995.appspot.com",
  messagingSenderId: "578117532273",
  appId: "1:578117532273:web:3e52426b147f1c7e5af9d0",
  measurementId: "G-VWLDSR92KV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Global state (replace your existing balance initialization)
let userBalance = 0;
let unsubscribeBalance = null;

// Account menu functionality
document.addEventListener('DOMContentLoaded', () => {
  // Toggle dropdown menu
  const accountButton = document.getElementById('account-button');
  const accountDropdown = document.getElementById('account-dropdown');
  
  accountButton.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelector('.account-menu-container').classList.toggle('active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    document.querySelector('.account-menu-container').classList.remove('active');
  });

  // Settings button
  document.getElementById('settings-btn').addEventListener('click', () => {
    window.location.href = "https://riodev0.github.io/settings";
  });

  // Logout button
  document.getElementById('logout-btn').addEventListener('click', () => {
    auth.signOut().then(() => {
      window.location.href = "https://riodev0.github.io/login";
    });
  });

  // Auth state listener
  auth.onAuthStateChanged(user => {
    if (user) {
      loadUserData(user.uid);
    } else {
      window.location.href = "https://riodev0.github.io/login";
    }
  });
});

// Load user data and set up real-time balance updates
async function loadUserData(userId) {
  // Set up real-time balance listener
  unsubscribeBalance = db.collection("users").doc(userId)
    .onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        userBalance = data.balance || 0;
        
        // Update UI
        document.getElementById('balance').textContent = userBalance;
        document.getElementById('username-display').textContent = data.username || 'Player';
        
        // Update your game's balance state
        if (typeof state !== 'undefined') {
          state.balance = userBalance;
        }
      }
    }, error => {
      console.error("Balance update error:", error);
    });
}

// Update balance in Firestore (use this instead of direct balance modifications)
async function updateBalance(amount) {
  try {
    const user = auth.currentUser;
    if (!user) return;

    await db.collection("users").doc(user.uid).update({
      balance: firebase.firestore.FieldValue.increment(amount),
      lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating balance:", error);
  }
}

// Clean up when leaving page
window.addEventListener('beforeunload', () => {
  if (unsubscribeBalance) {
    unsubscribeBalance();
  }
});
