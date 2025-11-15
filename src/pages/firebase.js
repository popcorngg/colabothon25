import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const app = firebase.initializeApp({
  apiKey: "AIzaSyDMsMfpHoQZMHR7262DBf9tJOUKv2IIO44",
  authDomain: "bipboop-bb857.firebaseapp.com",
  projectId: "bipboop-bb857",
  storageBucket: "bipboop-bb857.appspot.com",
  messagingSenderId: "615732265160",
  appId: "1:615732265160:web:b90e1fdb4352e5f55a25fd"
});

export const auth = app.auth();
export default firebase;