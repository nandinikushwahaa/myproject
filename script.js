document.addEventListener("DOMContentLoaded", function () {
  // ✅ Check authentication status and update UI
  function checkAuthStatus() {
    const token = localStorage.getItem("token");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");

    if (loginBtn && logoutBtn) {
      if (token) {
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
      } else {
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
      }
    }
  }

  // ✅ Handle Modal Open/Close
  const authModal = document.getElementById("auth-modal");
  const closeModal = document.querySelector(".close");

  if (document.getElementById("login-btn")) {
    document
      .getElementById("login-btn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        authModal.style.display = "block";
      });
  }

  if (closeModal) {
    closeModal.addEventListener("click", function () {
      authModal.style.display = "none";
    });
  }

  window.addEventListener("click", function (event) {
    if (event.target === authModal) {
      authModal.style.display = "none";
    }
  });

  // ✅ Handle Login
  if (document.getElementById("login-submit")) {
    document
      .getElementById("login-submit")
      .addEventListener("click", async function (e) {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        if (!email || !password) {
          alert("Please fill in all fields.");
          return;
        }

        try {
          let response = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          let data = await response.json();

          if (data.token) {
            localStorage.setItem("token", data.token);
            alert("Login Successful!");
            authModal.style.display = "none";
            checkAuthStatus();
            loadCartItems();
          } else {
            alert("Login Failed: " + (data.message || "Invalid credentials"));
          }
        } catch (error) {
          console.error("Login Error:", error);
          alert("Login Failed: " + error.message);
        }
      });
  }

  // ✅ Handle Signup
  if (document.getElementById("signup-submit")) {
    document
      .getElementById("signup-submit")
      .addEventListener("click", async function (e) {
        e.preventDefault();
        const name = document.getElementById("signup-name").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;

        if (!name || !email || !password) {
          alert("Please fill in all fields.");
          return;
        }

        try {
          let response = await fetch("http://localhost:5000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          let data = await response.json();

          if (data.message === "User registered successfully") {
            alert("Signup Successful! Please log in.");
            document.getElementById("login-form").style.display = "block";
            document.getElementById("signup-form").style.display = "none";
          } else {
            alert("Signup Failed: " + (data.message || "Unknown error"));
          }
        } catch (error) {
          console.error("Signup Error:", error);
          alert("Signup Failed: " + error.message);
        }
      });
  }

  // ✅ Handle Logout
  if (document.getElementById("logout-btn")) {
    document
      .getElementById("logout-btn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        localStorage.removeItem("token");
        alert("Logged out successfully!");
        checkAuthStatus();
        loadCartItems();
      });
  }

  // ✅ Add to Cart Functionality (Ensure Listeners Are Attached Only Once)
  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  addToCartButtons.forEach((button) => {
    button.removeEventListener("click", handleAddToCart); // Remove existing listeners to avoid duplicates
    button.addEventListener("click", handleAddToCart);
  });

  // ✅ Initial Checks
  checkAuthStatus();
});

// ✅ Handle Add to Cart
async function handleAddToCart(e) {
  e.preventDefault(); // Prevent default behavior (e.g., navigating to #)

  const productElement = e.target.closest(".pro");
  if (!productElement) return;

  const productId = productElement.dataset.id;
  const name = productElement.dataset.name;
  const price = parseFloat(productElement.dataset.price);
  const image = productElement.dataset.image;

  if (!productId || !name || isNaN(price) || !image) {
    console.error("❌ Invalid product data:", {
      productId,
      name,
      price,
      image,
    });
    alert("Error: Missing product details. Please try again.");
    return;
  }

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in to add items to the cart.");
    return;
  }

  try {
    let response = await fetch("http://localhost:5000/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: productId,
        name,
        price,
        image,
        quantity: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let data = await response.json();

    if (response.ok) {
      alert("Item added to cart!");
      loadCartItems(); // Reload cart to reflect changes
    } else {
      alert("Error adding item: " + data.message);
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("Error adding item. Please try again.");
  }
}

// ✅ Load Cart Items
async function loadCartItems() {
  const token = localStorage.getItem("token");
  const cartItemsContainer = document.querySelector("#cart-items");
  const cartSubtotal = document.querySelector("#cart-subtotal");
  const cartTotal = document.querySelector("#cart-total");

  if (!cartItemsContainer || !cartSubtotal || !cartTotal) {
    console.warn("Cart elements not found. Skipping loadCartItems.");
    return;
  }

  if (!token) {
    cartItemsContainer.innerHTML =
      "<tr><td colspan='6'>Please log in to view your cart.</td></tr>";
    cartSubtotal.innerText = "0.00";
    cartTotal.innerText = "0.00";
    return;
  }

  try {
    let response = await fetch("http://localhost:5000/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let cart = await response.json();

    cartItemsContainer.innerHTML = "";
    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        "<tr><td colspan='6'>Your cart is empty.</td></tr>";
      cartSubtotal.innerText = "0.00";
      cartTotal.innerText = "0.00";
      return;
    }

    let total = 0;
    cart.forEach((item) => {
      total += item.price * item.quantity;

      const cartItemRow = document.createElement("tr");
      cartItemRow.innerHTML = `
        <td><button class="remove" data-id="${item.id}">❌</button></td>
        <td><img src="${item.image}" alt="${item.name}" width="50"></td>
        <td>${item.name}</td>
        <td>Rs. ${item.price.toFixed(2)}</td>
        <td>
          <button class="decrease" data-id="${item.id}">-</button> 
          <span>${item.quantity}</span>
          <button class="increase" data-id="${item.id}">+</button>
        </td>
        <td>Rs. ${(item.price * item.quantity).toFixed(2)}</td>
      `;
      cartItemsContainer.appendChild(cartItemRow);
    });

    cartSubtotal.innerText = total.toFixed(2);
    cartTotal.innerText = total.toFixed(2);

    attachCartEventListeners();
  } catch (error) {
    console.error("Error loading cart:", error);
    alert("Error loading cart. Please try again.");
  }
}

// ✅ Attach Event Listeners to Cart Buttons
function attachCartEventListeners() {
  document.querySelectorAll(".remove").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const id = btn.dataset.id;
      try {
        let response = await fetch(`http://localhost:5000/api/cart/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        loadCartItems();
      } catch (error) {
        console.error("Error removing item:", error);
        alert("Error removing item. Please try again.");
      }
    });
  });

  document.querySelectorAll(".increase").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const id = btn.dataset.id;
      try {
        let response = await fetch(`http://localhost:5000/api/cart/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            quantity: parseInt(btn.previousElementSibling.innerText) + 1,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        loadCartItems();
      } catch (error) {
        console.error("Error increasing quantity:", error);
        alert("Error increasing quantity. Please try again.");
      }
    });
  });

  document.querySelectorAll(".decrease").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const id = btn.dataset.id;
      const newQty = Math.max(
        1,
        parseInt(btn.nextElementSibling.innerText) - 1
      );
      try {
        let response = await fetch(`http://localhost:5000/api/cart/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ quantity: newQty }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        loadCartItems();
      } catch (error) {
        console.error("Error decreasing quantity:", error);
        alert("Error decreasing quantity. Please try again.");
      }
    });
  });
}

// ✅ Initial Load
loadCartItems();
