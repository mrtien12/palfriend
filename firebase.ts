import exp from 'constants';
import { getApp,getApps, initializeApp } from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBOybRHPWzluLfHjP6isSUGM9ZRkHfAa7c",

    authDomain: "kepler-ce644.firebaseapp.com",
  
    projectId: "kepler-ce644",
  
    storageBucket: "kepler-ce644.appspot.com",
  
    messagingSenderId: "109737301593",
  
    appId: "1:109737301593:web:5694cc79c6190e207a8348"
  


};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {app, db, auth};