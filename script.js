document.addEventListener("DOMContentLoaded", function () {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Add to Cart Functionality
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      let productElement = this.closest(".pro");
      let id = productElement.getAttribute("data-id");
      let name = productElement.getAttribute("data-name");
      let price = parseFloat(productElement.getAttribute("data-price"));

      let existingItem = cart.find((item) => item.id === id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ id, name, price, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${name} added to cart!`);
    });
  });

  // Display Cart Items
  function renderCart() {
    let cartTable = document.getElementById("cart-items");
    let cartTotal = document.getElementById("cart-total");
    if (!cartTable) return;

    cartTable.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      let row = document.createElement("tr");
      row.innerHTML = `
                <td><button class="remove-item" data-index="${index}">X</button></td>
                <td><img src="n1.jpg" alt="${item.name}" width="50"></td>
                <td>${item.name}</td>
                <td>Rs.${item.price.toFixed(2)}</td>
                <td><input type="number" value="${
                  item.quantity
                }" data-index="${index}" min="1"></td>
                <td>Rs.${(item.price * item.quantity).toFixed(2)}</td>
            `;
      cartTable.appendChild(row);
      total += item.price * item.quantity;
    });

    cartTotal.textContent = total.toFixed(2);
  }

  if (document.getElementById("cart-items")) {
    renderCart();

    document.addEventListener("change", function (event) {
      if (event.target.type === "number") {
        let index = event.target.getAttribute("data-index");
        cart[index].quantity = parseInt(event.target.value);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
      }
    });

    document.addEventListener("click", function (event) {
      if (event.target.classList.contains("remove-item")) {
        let index = event.target.getAttribute("data-index");
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
      }
    });
  }

  window.checkout = function () {
    alert("Proceeding to checkout!");
  };
});
