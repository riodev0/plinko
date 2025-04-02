import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth-compat.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore-compat.js";

const firebaseConfig = {
  apiKey: "AIzaSyDfK_HayFBawYzgIcGXQsQ4ynyCrVHHL8A",
  authDomain: "tbgames-d6995.firebaseapp.com",
  projectId: "tbgames-d6995",
  storageBucket: "tbgames-d6995.appspot.com",
  messagingSenderId: "578117532273",
  appId: "1:578117532273:web:3e52426b147f1c7e5af9d0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// User data structure
const createUserData = (email) => ({
  email: email,
  balance: 10000, // Starting balance
  createdAt: new Date(),
  lastLogin: new Date(),
  games: {
    plinko: { wins: 0, losses: 0 },
    slots: { wins: 0, losses: 0 },
    blackjack: { wins: 0, losses: 0 }
  }
});

// Sign up new users
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCredential.user.uid), createUserData(email));
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Login existing users
export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await updateDoc(doc(db, "users", userCredential.user.uid), {
      lastLogin: new Date()
    });
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Get user data (for all games)
export const getUserData = async (userId) => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// Update balance (shared across all games)
export const updateBalance = async (userId, amount) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    balance: amount
  });
};

// Update game-specific stats
export const updateGameStats = async (userId, gameName, result) => {
  const userRef = doc(db, "users", userId);
  const fieldPath = `games.${gameName}.${result}`;
  
  await updateDoc(userRef, {
    [fieldPath]: firebase.firestore.FieldValue.increment(1)
  });
};
