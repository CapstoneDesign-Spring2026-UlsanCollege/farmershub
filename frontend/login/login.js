
let selectedRole = "";
let authMode = "login";
const API_BASE = getApiBase();
const AUTH_STORAGE_KEYS = ['fh_token', 'farmershub_token', 'fh_user', 'fh_loggedIn', 'fh_role', 'currentUser'];

function getApiBase() {
  const override = window.FARMERSHUB_API_BASE || "";
  if (override.trim()) return override.replace(/\/+$/, "");
  return "https://farmershub-kkjd.onrender.com/api";
}

function jsonHeaders() {
  return { "Content-Type": "application/json" };
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function clearSessionStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
}

function saveSession(user, token) {
  clearSessionStorage();
  if (token) {
    localStorage.setItem("fh_token", token);
    localStorage.setItem("farmershub_token", token);
  }
  if (user) {
    localStorage.setItem("fh_user", JSON.stringify(user));
    localStorage.setItem("fh_loggedIn", "true");
    localStorage.setItem("fh_role", user.role);
    localStorage.setItem("currentUser", user.email);
  }
}

async function registerUser(payload) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  const session = data?.data || data;
  saveSession(session.user, session.token);
  return data;
}

async function loginUser(payload) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify(payload),
  });
  const session = data?.data || data;
  saveSession(session.user, session.token);
  return data;
}

function showMessage(text, type) {
  const msg = document.getElementById("msg");
  msg.innerHTML = `<span class='${type}'>${text}</span>`;
}

function checkPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;

  return {
    checks,
    score,
    isStrong: score === Object.keys(checks).length,
  };
}

function updatePasswordStrength() {
  const password = document.getElementById("password").value;
  const strengthBar = document.getElementById("strengthBar");
  const strengthText = document.getElementById("strengthText");
  const passwordRules = document.getElementById("passwordRules");
  if (!strengthBar || !strengthText || !passwordRules) return;

  const result = checkPasswordStrength(password);

  Object.entries(result.checks).forEach(([rule, passed]) => {
    const item = passwordRules.querySelector(`[data-rule="${rule}"]`);
    if (!item) return;
    item.classList.toggle("passed", passed);
  });

  const labels = ["Not started", "Very weak", "Weak", "Okay", "Good", "Strong"];
  const classes = ["", "very-weak", "weak", "okay", "good", "strong"];
  strengthBar.style.width = `${result.score * 20}%`;
  strengthBar.className = classes[result.score];
  strengthText.textContent = `Password strength: ${labels[result.score]}`;
}

function setRequired(ids, isRequired) {
  ids.forEach((id) => {
    document.getElementById(id).required = isRequired;
  });
}

function setAuthMode(mode) {
  authMode = mode;
  const isSignup = mode === "signup";
  const title = document.getElementById("title");
  const btn = document.getElementById("btn");
  const loginTab = document.getElementById("loginTab");
  const signupTab = document.getElementById("signupTab");
  const roleLoginTab = document.getElementById("roleLoginTab");
  const roleSignupTab = document.getElementById("roleSignupTab");
  const modeToggle = document.getElementById("modeToggle");

  document.getElementById("signupFields").classList.toggle("hidden", !isSignup);
  document.querySelectorAll(".signup-only").forEach((element) => {
    element.classList.toggle("hidden", !isSignup);
  });

  setRequired(["fullName", "age", "gender", "address", "phone", "paymentMethod", "confirmPassword"], isSignup);

  loginTab?.classList.toggle("active", !isSignup);
  signupTab?.classList.toggle("active", isSignup);
  roleLoginTab?.classList.toggle("active", !isSignup);
  roleSignupTab?.classList.toggle("active", isSignup);
  btn.textContent = isSignup ? "Create Account" : "Login";
  modeToggle.textContent = isSignup ? "Already have an account? Login" : "Don't have an account? Sign Up";

  if (selectedRole) {
    const roleName = selectedRole === "farmer" ? "Farmer" : "Customer";
    title.textContent = isSignup ? `Create ${roleName} Account` : `${roleName} Login`;
  }

  document.getElementById("msg").innerHTML = "";
  updatePasswordStrength();
}

async function handleSignup(email, password) {
  const fullName = document.getElementById("fullName").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value;
  const age = parseInt(document.getElementById("age").value, 10);
  const gender = document.getElementById("gender").value;
  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const paymentMethod = document.getElementById("paymentMethod").value;
  const strength = checkPasswordStrength(password);

  if (!fullName || !confirmPassword || !age || !gender || !address || !phone || !paymentMethod) {
    showMessage("Please fill in all signup fields", "error");
    return false;
  }

  if (age < 16) {
    showMessage("You must be at least 16 years old", "error");
    return false;
  }

  if (password !== confirmPassword) {
    showMessage("Passwords do not match", "error");
    return false;
  }

  if (!strength.isStrong) {
    showMessage("Please use a strong password that meets every rule.", "error");
    return false;
  }

  await registerUser({
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

  clearSessionStorage();
  document.getElementById("form").reset();
  setAuthMode("login");
  showMessage("Account created! You can login now.", "success");
  return true;
}

async function handleLogin(email, password) {
  const data = await loginUser({ email, password });
  const session = data?.data || data;
  const user = session?.user;

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
  btn.textContent = authMode === "signup" ? "Creating account..." : "Logging in...";

  try {
    if (authMode === "signup") {
      await handleSignup(email, password);
    } else {
      await handleLogin(email, password);
    }
  } catch (err) {
    showMessage(err.message || "Cannot connect to server. Please try again.", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = authMode === "signup" ? "Create Account" : "Login";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const roleScreen = document.getElementById("roleScreen");
  const formScreen = document.getElementById("formScreen");
  const roleBadge = document.getElementById("roleBadge");

  document.getElementById("pickFarmer").addEventListener("click", () => {
    selectedRole = "farmer";
    roleBadge.textContent = "Farmer";
    roleScreen.classList.add("hidden");
    formScreen.classList.remove("hidden");
    setAuthMode(authMode);
  });

  document.getElementById("pickCustomer").addEventListener("click", () => {
    selectedRole = "customer";
    roleBadge.textContent = "Customer";
    roleScreen.classList.add("hidden");
    formScreen.classList.remove("hidden");
    setAuthMode(authMode);
  });

  document.getElementById("backToRole").addEventListener("click", () => {
    formScreen.classList.add("hidden");
    roleScreen.classList.remove("hidden");
    document.getElementById("msg").innerHTML = "";
  });

  document.getElementById("loginTab").addEventListener("click", () => setAuthMode("login"));
  document.getElementById("signupTab").addEventListener("click", () => setAuthMode("signup"));
  document.getElementById("roleLoginTab").addEventListener("click", () => setAuthMode("login"));
  document.getElementById("roleSignupTab").addEventListener("click", () => setAuthMode("signup"));
  document.getElementById("modeToggle").addEventListener("click", () => {
    setAuthMode(authMode === "signup" ? "login" : "signup");
  });
  document.getElementById("password").addEventListener("input", updatePasswordStrength);
  document.getElementById("form").addEventListener("submit", onSubmit);
  setAuthMode("login");
});
