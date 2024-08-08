// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDW74XsABf9eo6jNPdRFXUVbpAg9o3ZOmE",
  authDomain: "inventory-management-c64c5.firebaseapp.com",
  projectId: "inventory-management-c64c5",
  storageBucket: "inventory-management-c64c5.appspot.com",
  messagingSenderId: "960969782475",
  appId: "1:960969782475:web:930ccb2309d6e0f41e574e",
  measurementId: "G-BM08HPFL63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);


export {app, auth, firestore, storage}