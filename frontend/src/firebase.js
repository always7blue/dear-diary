import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase config - Bu değerleri Firebase Console'dan alacaksın
const firebaseConfig = {
  apiKey: "AIzaSyBENuTE4kW_lGQdTxqJ9mIOG93rF2I1VQw",
  authDomain: "dear-diary-aaf67.firebaseapp.com",
  projectId: "dear-diary-aaf67",
  storageBucket: "dear-diary-aaf67.firebasestorage.app",
  messagingSenderId: "600929795157",
  appId: "1:600929795157:web:a960faf08cafedb26168dc"
};

// Firebase'i initialize et
const app = initializeApp(firebaseConfig);

// Auth instance'ı oluştur
export const auth = getAuth(app);

// Google Auth Provider'ı oluştur
export const googleProvider = new GoogleAuthProvider();

export default app;
