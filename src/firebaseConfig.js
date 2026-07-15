// ============================================================
//  RayaFoods — firebaseConfig.js
//  Place this file at: src/firebaseConfig.js
// ============================================================

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyDlk8jAKEwD64EJvvwW8htGa6kCk0cgZWA",
  authDomain:        "rayafoods-e5a1e.firebaseapp.com",
  projectId:         "rayafoods-e5a1e",
  storageBucket:     "rayafoods-e5a1e.firebasestorage.app",
  messagingSenderId: "1042784415072",
  appId:             "1:1042784415072:web:bd33744db159095f718205"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
