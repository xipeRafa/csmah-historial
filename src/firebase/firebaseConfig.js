import firebase from 'firebase/compat/app';

import 'firebase/compat/firestore';
import 'firebase/compat/storage';

import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';

//require("dotenv").config()


const app = firebase.initializeApp({

     apiKey: "AIzaSyBYV8D5azaDbu5KiRvy4AjZRsFv6zZVOMs",
     authDomain: "gym-e-535e5.firebaseapp.com",
     projectId: "gym-e-535e5",
     storageBucket: "gym-e-535e5.appspot.com",
     messagingSenderId: "460760932367",
     appId: "1:460760932367:web:fbaa98b45209ecdb77c37a"

});



export const firestoreDB = getFirestore(app)


export const storageDocs = getStorage(app);