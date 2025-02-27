document.addEventListener("DOMContentLoaded", () => {
  loadCartItems();

  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", handleAddToCart, { once: true });
  });
});

// Function to handle adding item to cart
async function handleAddToCart(event) {
  event.preventDefault();

  const button = event.currentTarget;
  const product = button.closest(".pro");
  if (!product) return;

  const productId = product.getAttribute("data-id");
  const productName = product.getAttribute("data-name");
  const productPrice = parseFloat(product.getAttribute("data-price"));
  const productImage = product.getAttribute("data-image");

  if (!productId || !productName || isNaN(productPrice) || !productImage) {
    console.error("Invalid product data");
    return;
  }

  const cartItem = {
    id: productId,
    name: productName,
    price: productPrice,
    image: productImage,
    quantity: 1,
  };

  try {
    let response = await fetch("http://localhost:5000/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cartItem),
    });

    let data = await response.json();
    alert(`${productName} added to cart!`);
    loadCartItems();
  } catch (error) {
    console.error("Error adding item to cart:", error);
  }
}

// Function to load cart items from MongoDB
async function loadCartItems() {
  try {
    let response = await fetch("http://localhost:5000/cart");
    let cart = await response.json();

    const cartItemsContainer = document.querySelector("#cart-items");
    const cartSubtotal = document.querySelector("#cart-subtotal");
    const cartTotal = document.querySelector("#cart-total");

    if (!cartItemsContainer || !cartSubtotal || !cartTotal) return;

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

    document
      .querySelectorAll(".increase")
      .forEach((button) => button.addEventListener("click", updateQuantity));
    document
      .querySelectorAll(".decrease")
      .forEach((button) => button.addEventListener("click", updateQuantity));
    document
      .querySelectorAll(".remove")
      .forEach((button) => button.addEventListener("click", removeItem));
  } catch (error) {
    console.error("Error loading cart:", error);
  }
}

// Function to update quantity in MongoDB
async function updateQuantity(event) {
  const productId = event.target.getAttribute("data-id");
  let response = await fetch(`http://localhost:5000/cart`);
  let cart = await response.json();

  let item = cart.find((item) => item.id === productId);
  if (!item) return;

  if (event.target.classList.contains("increase")) {
    item.quantity += 1;
  } else if (event.target.classList.contains("decrease") && item.quantity > 1) {
    item.quantity -= 1;
  }

  try {
    await fetch(`http://localhost:5000/cart/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: item.quantity }),
    });
    loadCartItems();
  } catch (error) {
    console.error("Error updating quantity:", error);
  }
}

// Function to remove an item from cart in MongoDB
async function removeItem(event) {
  const productId = event.target.getAttribute("data-id");

  try {
    await fetch(`http://localhost:5000/cart/${productId}`, {
      method: "DELETE",
    });
    loadCartItems();
  } catch (error) {
    console.error("Error removing item:", error);
  }
}

// Function for checkout (example action)
function checkout() {
  alert("Proceeding to checkout...");
}
