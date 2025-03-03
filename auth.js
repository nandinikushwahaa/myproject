document
  .getElementById("login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      let response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data = await response.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        alert("Login successful!");
        window.location.href = "index.html"; // Redirect to homepage
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  });
