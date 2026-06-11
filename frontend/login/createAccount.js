function normalizeBase(url) {
  return String(url || '').replace(/\/+$/, '');
}

function detectApiBase() {
  const runtimeOverride = normalizeBase(window.FARMERSHUB_API_BASE);
  if (runtimeOverride) return runtimeOverride;

  if (window.location.protocol === 'file:') {
    return 'https://farmershub-kkjd.onrender.com/api';
  }

  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }

  return 'https://farmershub-kkjd.onrender.com/api';
}

const API_BASE = detectApiBase();

async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Request timed out. Please try again.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function clearSessionStorage() {
  ['fh_token', 'fh_user', 'fh_loggedIn', 'fh_role', 'currentUser'].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

async function register(payload) {
  const res = await fetchWithTimeout(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Account creation failed');
  return data.data || {};
}

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
  const age = parseInt(document.getElementById("age").value, 10);
  const gender = document.getElementById("gender").value;
  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const paymentMethod = document.getElementById("paymentMethod").value;

  if (!fullName || !email || !password || !confirmPassword || !age || !gender || !address || !phone || !paymentMethod) {
    showMessage("Please fill in all fields", "error");
    return;
  }
  if (!selectedRole) {
    showMessage("Please choose Farmer or Customer first", "error");
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

  const btn = document.getElementById("btn");
  btn.disabled = true;
  btn.textContent = "Creating account...";

  try {
    await register({
      fullName,
      email,
      password,
      role: selectedRole,
      age,
      gender,
      address,
      phone,
      paymentMethod,
    });

    // Keep signup -> login flow explicit.
    clearSessionStorage();
    showMessage("Account created! Redirecting to login...", "success");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (err) {
    showMessage(err.message || "Cannot connect to server. Please try again.", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Create Account";
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
    title.textContent = "Create Farmer Account";
    roleScreen.classList.add("hidden");
    formScreen.classList.remove("hidden");
  });

  document.getElementById("pickCustomer").addEventListener("click", () => {
    selectedRole = "customer";
    roleBadge.textContent = "🛒 Customer";
    title.textContent = "Create Customer Account";
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
