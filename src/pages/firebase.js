import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDMsMfpHoQZMHR7262DBf9tJOUKv2IIO44",
  authDomain: "bipboop-bb857.firebaseapp.com",
  projectId: "bipboop-bb857",
  storageBucket: "bipboop-bb857.appspot.com",
  messagingSenderId: "615732265160",
  appId: "1:615732265160:web:b90e1fdb4352e5f55a25fd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;