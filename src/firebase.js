// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxcs1Q3gFNjmyzely3oBPiozVrbN1-XlI",
  authDomain: "http://localhost:3000/login",
  projectId: "bank-9f545",
  storageBucket: "bank-9f545.firebasestorage.app",
  messagingSenderId: "342830051086",
  appId: "1:342830051086:web:0a4986713b0053203a315f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);