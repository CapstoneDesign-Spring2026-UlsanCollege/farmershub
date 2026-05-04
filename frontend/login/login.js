import { login as loginUser, clearSessionStorage } from '../js/authService.js';

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
  if (!selectedRole) {
    showMessage("Please choose Farmer or Customer first", "error");
    return;
  }

  const btn = document.getElementById("btn");
  btn.disabled = true;
  btn.textContent = "Logging in...";

  try {
    const data = await loginUser({ email, password });
    const user = data.user;

    if (!user) {
      showMessage("Login response is missing user data.", "error");
      return;
    }

    if (user.role !== selectedRole) {
      clearSessionStorage();
      showMessage(`This account is registered as ${user.role}. Please pick the correct role.`, "error");
      return;
    }

    showMessage("Login successful! Redirecting...", "success");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1000);
  } catch (err) {
    showMessage(err.message || "Cannot connect to server. Please try again.", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Login";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const roleScreen = document.getElementById("roleScreen");
  const formScreen = document.getElementById("formScreen");
  const roleBadge = document.getElementById("roleBadge");
  const title = document.getElementById("title");

  document.getElementById("pickFarmer").addEventListener("click", () => {
    selectedRole = "farmer";
    roleBadge.textContent = "🌾 Farmer";
    title.textContent = "Farmer Login";
    roleScreen.classList.add("hidden");
    formScreen.classList.remove("hidden");
  });

  document.getElementById("pickCustomer").addEventListener("click", () => {
    selectedRole = "customer";
    roleBadge.textContent = "🛒 Customer";
    title.textContent = "Customer Login";
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
