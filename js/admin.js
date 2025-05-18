import { auth, database } from "./firebaseconfiguration.js";
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const userTable = document.getElementById("user-table");
const logoutBtn = document.getElementById("logout-btn");

// Authentication and role check
onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.log("No user authenticated, redirecting to account.html");
    window.location.href = "account.html";
    return;
  }

  const userRef = ref(database, `users/${user.uid}`);
  onValue(
    userRef,
    (snapshot) => {
      if (snapshot.exists() && snapshot.val().role === "admin") {
        console.log("User is an admin, loading users...");
        loadUsers();
      } else {
        console.error("Access denied: User is not an admin");
        alert("Access denied: Admins only.");
        window.location.href = "account.html";
      }
    },
    (error) => {
      console.error("Error checking user role:", error);
      alert("Error loading user data: " + error.message);
      window.location.href = "account.html";
    },
    { onlyOnce: true }
  );
});

// Load users
function loadUsers() {
  const usersRef = ref(database, "users");
  userTable.innerHTML = `<tr><td colspan="6" class="text-center">Loading users...</td></tr>`;
  onValue(
    usersRef,
    (snapshot) => {
      console.log("Fetching users data...");
      userTable.innerHTML = ""; // Clear loading state

      if (snapshot.exists()) {
        console.log("Users data found:", snapshot.val());
        snapshot.forEach((childSnapshot) => {
          const user = childSnapshot.val();
          console.log("Processing user:", user);
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${user.fullName || "N/A"}</td>
            <td>${user.email || "N/A"}</td>
            <td>${user.password || "N/A"}</td>
            <td>${(user.role || "N/A").charAt(0).toUpperCase() + (user.role || "N/A").slice(1)}</td>
            <td>${user.userId || "N/A"}</td>
            <td><button class="btn btn-sm btn-outline-success" onclick="resetPassword('${user.email}')">Reset Password</button></td>
          `;
          userTable.appendChild(row);
        });
      } else {
        console.log("No users found in database");
        userTable.innerHTML = `<tr><td colspan="6" class="text-center">No users found.</td></tr>`;
      }
    },
    (error) => {
      console.error("Error fetching users:", error);
      userTable.innerHTML = `<tr><td colspan="6" class="text-center">Error loading users: ${error.message}</td></tr>`;
    }
  );
}

// Reset password
window.resetPassword = function(email) {
  if (!email) {
    alert("Error: No email provided for password reset.");
    return;
  }
  sendPasswordResetEmail(auth, email)
    .then(() => {
      console.log(`Password reset email sent to ${email}`);
      alert(`Password reset email sent to ${email}`);
    })
    .catch((error) => {
      console.error("Error sending password reset email:", error);
      alert(`Error sending password reset email: ${error.message}`);
    });
};

// Logout
logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("User logged out, redirecting to account.html");
      window.location.href = "account.html";
    })
    .catch((error) => {
      console.error("Logout failed:", error);
      alert("Logout failed: " + error.message);
    });
});