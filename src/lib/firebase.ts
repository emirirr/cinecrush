import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCh3Tv4eoTEUyHSOYXqWWFceW6ty-g7hwo",
  authDomain: "cinecrus.firebaseapp.com",
  projectId: "cinecrus",
  storageBucket: "cinecrus.firebasestorage.app",
  messagingSenderId: "406906109090",
  appId: "1:406906109090:web:91b1d0302098e00a802bfb",
  measurementId: "G-8MD2DS8Y87",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence (best-effort)
enableIndexedDbPersistence(db).catch(() => {
  // ignore persistence errors (multiple tabs etc.)
});

export const initAnalytics = async () => {
  try {
    if (await analyticsSupported()) {
      return getAnalytics(app);
    }
  } catch {}
  return null;
};

export default app;
