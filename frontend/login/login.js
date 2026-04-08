const API_URL = "http://localhost:3000/api/auth";
let selectedRole = "";

function showMessage(text, type) {
  const msg = document.getElementById("msg");
  msg.innerHTML = `<span class='${type}'>${text}</span>`;
}

async function onSubmit(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showMessage("Please fill in all required fields", "error");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: selectedRole })
    });
    const data = await res.json();

    if (data.success) {
      showMessage("Login successful", "success");
      localStorage.setItem("currentUser", email);
      localStorage.setItem("fh_loggedIn", "true");
      localStorage.setItem("fh_role", selectedRole);

      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1000);
    } else {
      showMessage(data.message, "error");
    }
  } catch (err) {
    showMessage("Cannot connect to server. Please try again.", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const roleScreen = document.getElementById("roleScreen");
  const formScreen = document.getElementById("formScreen");
  const roleBadge = document.getElementById("roleBadge");

  document.getElementById("pickFarmer").addEventListener("click", () => {
    selectedRole = "farmer";
    roleBadge.textContent = "🌾 Farmer";
    roleScreen.classList.add("hidden");
    formScreen.classList.remove("hidden");
  });

  document.getElementById("pickCustomer").addEventListener("click", () => {
    selectedRole = "customer";
    roleBadge.textContent = "🛒 Customer";
    roleScreen.classList.add("hidden");
    formScreen.classList.remove("hidden");
  });

  document.getElementById("backToRole").addEventListener("click", () => {
    formScreen.classList.add("hidden");
    roleScreen.classList.remove("hidden");
    document.getElementById("msg").innerHTML = "";
  });

  document.getElementById("form").addEventListener("submit", onSubmit);
});
