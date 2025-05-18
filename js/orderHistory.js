import { auth, database } from "./firebaseconfiguration.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const orderHistoryBody = document.getElementById("order-history-body");
const noOrdersMessage = document.getElementById("no-orders-message");

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Fetch user role
    const userRef = ref(database, `users/${user.uid}`);
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const isAdmin = userData.role === "admin";
        fetchOrders(user.uid, isAdmin);
      }
    }, { onlyOnce: true });
  }
});

function fetchOrders(userId, isAdmin) {
  const ordersRef = isAdmin ? ref(database, "orders") : ref(database, `orders/${userId}`);
  onValue(ordersRef, (snapshot) => {
    orderHistoryBody.innerHTML = "";
    noOrdersMessage.classList.add("d-none");

    if (!snapshot.exists()) {
      noOrdersMessage.classList.remove("d-none");
      return;
    }

    const orders = [];
    if (isAdmin) {
      // For admins, iterate through all users' orders
      snapshot.forEach((userSnapshot) => {
        userSnapshot.forEach((orderSnapshot) => {
          orders.push({
            userId: userSnapshot.key,
            orderId: orderSnapshot.key,
            ...orderSnapshot.val(),
          });
        });
      });
    } else {
      // For regular users, get their own orders
      snapshot.forEach((orderSnapshot) => {
        orders.push({
          userId,
          orderId: orderSnapshot.key,
          ...orderSnapshot.val(),
        });
      });
    }

    if (orders.length === 0) {
      noOrdersMessage.classList.remove("d-none");
      return;
    }

    orders.forEach((order) => {
      const row = document.createElement("tr");
      const itemsList = order.items.map((item) => `${item.name} (Qty: ${item.quantity})`).join(", ");
      const statusClass = order.status === "Pending" ? "text-warning" : "text-success";
      
      row.innerHTML = `
        <td>${order.orderId}</td>
        <td>${new Date(order.date).toLocaleDateString()}</td>
        <td>${itemsList}</td>
        <td>$${order.total.toFixed(2)}</td>
        <td class="${statusClass}">${order.status}</td>
        <td>
          ${isAdmin && order.status === "Pending" ? `<button class="btn btn-sm btn-success approve-btn" data-user-id="${order.userId}" data-order-id="${order.orderId}">Approve</button>` : ""}
        </td>
      `;
      orderHistoryBody.appendChild(row);
    });

    // Add event listeners for approve buttons
    if (isAdmin) {
      document.querySelectorAll(".approve-btn").forEach((button) => {
        button.addEventListener("click", () => {
          const userId = button.dataset.userId;
          const orderId = button.dataset.orderId;
          approveOrder(userId, orderId, button);
        });
      });
    }
  });
}

function approveOrder(userId, orderId, button) {
  const orderRef = ref(database, `orders/${userId}/${orderId}`);
  button.disabled = true;
  button.textContent = "Approving...";

  update(orderRef, { status: "Approved" })
    .then(() => {
      alert("Order approved successfully!");
    })
    .catch((error) => {
      alert("Failed to approve order: " + error.message);
    })
    .finally(() => {
      button.disabled = false;
      button.textContent = "Approve";
    });
}