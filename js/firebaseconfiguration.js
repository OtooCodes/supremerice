  // Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAjX-RR7MZjPelLJGFEtE7YlVIr79dJdeQ",
    authDomain: "supremerice-a2f02.firebaseapp.com",
    databaseURL: "https://supremerice-a2f02-default-rtdb.firebaseio.com",
    projectId: "supremerice-a2f02",
    storageBucket: "supremerice-a2f02.firebasestorage.app",
    messagingSenderId: "583941254273",
    appId: "1:583941254273:web:a3406e7b5a483a5bc6f180"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  export const auth = getAuth(app);
  export const database = getDatabase(app);

