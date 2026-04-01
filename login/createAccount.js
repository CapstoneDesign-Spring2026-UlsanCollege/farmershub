const API_URL = "http://localhost:3000/api/auth";
let selectedRole = "";

function showMessage(text, type) {
  const msg = document.getElementById("msg");
  msg.innerHTML = `<span class='${type}'>${text}</span>`;
}

async function onSubmit(event) {
  event.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const age = parseInt(document.getElementById("age").value);
  const gender = document.getElementById("gender").value;
  const address = document.getElementById("address").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const paymentMethod = document.getElementById("paymentMethod").value;

  if (!fullName || !email || !password || !confirmPassword || !age || !gender || !address || !contact || !paymentMethod) {
    showMessage("Please fill in all fields", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Passwords do not match", "error");
    return;
  }

  if (age < 16) {
    showMessage("You must be at least 16 years old", "error");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: selectedRole, fullName, age, gender, address, contact, paymentMethod })
    });
    const data = await res.json();

    if (data.success) {
      showMessage("Account created! Redirecting to login...", "success");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
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
