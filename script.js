document.addEventListener("DOMContentLoaded", function () {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Function to render the cart
  function renderCart() {
    let cartTable = document.getElementById("cart-items");
    let cartSubtotal = document.getElementById("cart-subtotal");
    let cartTotal = document.getElementById("cart-total");

    if (!cartTable) return;

    cartTable.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      // Ensure price is valid
      let price = item.price && !isNaN(item.price) ? parseFloat(item.price) : 0;
      let quantity = item.quantity && !isNaN(item.quantity) ? item.quantity : 1;

      let row = document.createElement("tr");
      row.innerHTML = `
        <td><button class="remove-item" data-index="${index}">X</button></td>
        <td><img src="${item.image}" alt="${item.name}" width="50"></td>
        <td>${item.name}</td>
        <td>Rs.${price.toFixed(2)}</td>
        <td><input type="number" value="${quantity}" data-index="${index}" min="1"></td>
        <td>Rs.${(price * quantity).toFixed(2)}</td>
      `;
      cartTable.appendChild(row);
      total += price * quantity;
    });

    // Update totals
    cartSubtotal.textContent = total.toFixed(2);
    cartTotal.textContent = total.toFixed(2);
  }

  // Function to update quantity and total price
  function updateQuantity(event) {
    if (event.target.type === "number") {
      let index = event.target.getAttribute("data-index");
      cart[index].quantity = parseInt(event.target.value);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    }
  }

  // Function to remove item from cart
  function removeItem(event) {
    if (event.target.classList.contains("remove-item")) {
      let index = event.target.getAttribute("data-index");
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    }
  }

  // Load cart when cart page is open
  if (document.getElementById("cart-items")) {
    renderCart();
    document.addEventListener("change", updateQuantity);
    document.addEventListener("click", removeItem);
  }

  // Function to add items to cart from shop page
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      let productElement = this.closest(".pro");
      let id = productElement.getAttribute("data-id");
      let name = productElement.getAttribute("data-name");
      let price = parseFloat(productElement.getAttribute("data-price"));
      let image = productElement.getAttribute("data-image");

      if (isNaN(price) || !name || !image || !id) {
        alert("Invalid product data!");
        return;
      }

      let existingItem = cart.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ id, name, price, image, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${name} added to cart!`);
    });
  });

  // Checkout function
  window.checkout = function () {
    if (cart.length === 0) {
      alert("Your cart is empty!");
    } else {
      alert("Proceeding to checkout!");
      localStorage.removeItem("cart"); // Clear cart after checkout
      renderCart();
    }
  };
});
