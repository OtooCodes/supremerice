import { auth, database } from "./firebaseconfiguration.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard-section");
const authForm = document.getElementById("auth-form");
const authTitle = document.getElementById("auth-title");
const authBtn = document.getElementById("auth-btn");
const toggleAuth = document.getElementById("toggle-auth");
const registerFields = document.getElementById("register-fields");
const userName = document.getElementById("user-name");
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const profileRole = document.getElementById("profile-role");
const logoutBtn = document.getElementById("logout-btn");
const adminBtn = document.getElementById("admin-btn");

let isLoginMode = true;

// Get redirect URL from query parameter
const urlParams = new URLSearchParams(window.location.search);
const redirectUrl = urlParams.get("redirect") || "index.html";

// Toggle between login and register
toggleAuth.addEventListener("click", (e) => {
  e.preventDefault();
  isLoginMode = !isLoginMode;
  authTitle.textContent = isLoginMode ? "Login" : "Register";
  authBtn.textContent = isLoginMode ? "Login" : "Register";
  toggleAuth.textContent = isLoginMode ? "Need an account? Register here" : "Already have an account? Login here";
  registerFields.classList.toggle("d-none", isLoginMode);
  authForm.reset();
});

// Form submission
authForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  authBtn.disabled = true;
  authBtn.textContent = "Processing...";

  if (isLoginMode) {
    // Login
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        authForm.reset();
        window.location.href = redirectUrl; // Redirect to intended page
      })
      .catch((error) => {
        console.error("Login error:", error.code, error.message);
        alert(`Login failed: ${error.message}`);
      })
      .finally(() => {
        authBtn.disabled = false;
        authBtn.textContent = "Login";
      });
  } else {
    // Register
    const fullName = document.getElementById("fullName").value;
    const role = document.getElementById("role").value;
    console.log("Attempting to register user:", { email, fullName, role });
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const userId = userCredential.user.uid;
        console.log("User created in Firebase Auth:", userId);
        // Write user data to the database
        const userRef = ref(database, `users/${userId}`);
        const userData = {
          fullName: fullName,
          email: email,
          role: role,
          userId: userId,
          createdAt: new Date().toISOString()
        };
        console.log("Writing user data to database:", userData);
        return set(userRef, userData);
      })
      .then(() => {
        console.log("User data successfully written to database");
        alert("Registration successful! Please login.");
        isLoginMode = true;
        authTitle.textContent = "Login";
        authBtn.textContent = "Login";
        toggleAuth.textContent = "Need an account? Register here";
        registerFields.classList.add("d-none");
        authForm.reset();
      })
      .catch((error) => {
        console.error("Registration error:", error.code, error.message);
        alert(`Registration failed: ${error.message}`);
      })
      .finally(() => {
        authBtn.disabled = false;
        authBtn.textContent = "Register";
      });
  }
});

// Authentication state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is authenticated:", user.uid, user.email);
    authSection.classList.add("d-none");
    dashboardSection.classList.remove("d-none");
    const userRef = ref(database, `users/${user.uid}`);
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log("User data fetched from database:", userData);
        userName.textContent = userData.fullName || "Unknown Name";
        profileName.textContent = userData.fullName || "Unknown Name";
        profileEmail.textContent = userData.email || user.email || "Unknown Email";
        profileRole.textContent = (userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : "User");
        adminBtn.classList.toggle("d-none", userData.role !== "admin");
        document.getElementById("profile-warning").classList.add("d-none");
        // Redirect to intended page if not already on account.html
        if (window.location.pathname.includes("account.html") && redirectUrl !== "account.html") {
          window.location.href = redirectUrl;
        }
      } else {
        console.warn("No user data found in database for UID:", user.uid);
        // Fallback to auth user data
        userName.textContent = user.displayName || "Unknown Name";
        profileName.textContent = user.displayName || "Unknown Name";
        profileEmail.textContent = user.email || "Unknown Email";
        profileRole.textContent = "User";
        adminBtn.classList.add("d-none");
        document.getElementById("profile-warning").classList.remove("d-none");
        // Prompt user to update profile
        alert("Profile data is incomplete. Please update your profile.");
      }
    }, (error) => {
      console.error("Error fetching user data:", error.code, error.message);
      alert("Failed to load profile data. Please try again.");
    });
  } else {
    console.log("No user is authenticated");
    authSection.classList.remove("d-none");
    dashboardSection.classList.add("d-none");
  }
});

// Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "account.html";
    })
    .catch((error) => {
      console.error("Logout error:", error.code, error.message);
      alert(`Logout failed: ${error.message}`);
    });
});

// Admin dashboard redirect
adminBtn.addEventListener("click", () => {
  window.location.href = "admin.html";
});