const API_BASE = "http://localhost:3000/api/auth";

let isLogin = true;
let selectedRole = null; // "farmer" or "customer"

/* ---- Role Selection ---- */
function selectRole(role) {
  selectedRole = role;

  const roleScreen = document.getElementById("roleScreen");
  const formScreen = document.getElementById("formScreen");
  const roleBadge = document.getElementById("roleBadge");

  // Animate role screen out
  roleScreen.classList.add("slide-out-left");

  setTimeout(() => {
    roleScreen.classList.add("hidden");
    roleScreen.classList.remove("slide-out-left");

    // Show form screen
    roleBadge.textContent = role === "farmer" ? "🌾 Farmer" : "🛒 Customer";
    roleBadge.className = "role-badge " + role;
    formScreen.classList.remove("hidden");
    formScreen.classList.add("slide-in-right");

    setTimeout(() => formScreen.classList.remove("slide-in-right"), 500);
  }, 400);
}

function goBackToRole() {
  const roleScreen = document.getElementById("roleScreen");
  const formScreen = document.getElementById("formScreen");

  formScreen.classList.add("slide-out-right");

  setTimeout(() => {
    formScreen.classList.add("hidden");
    formScreen.classList.remove("slide-out-right");

    roleScreen.classList.remove("hidden");
    roleScreen.classList.add("slide-in-left");

    setTimeout(() => roleScreen.classList.remove("slide-in-left"), 500);
  }, 400);

  selectedRole = null;
}

/* ---- Login / Signup Toggle ---- */
function switchForm() {
  isLogin = !isLogin;

  document.getElementById("title").innerText = isLogin ? "Login" : "Sign Up";
  document.getElementById("btn").innerText = isLogin ? "Login" : "Sign Up";
  document.getElementById("confirmBox").classList.toggle("active", !isLogin);
  document.getElementById("signupFields").classList.toggle("active", !isLogin);
  document.querySelector(".toggle").innerText =
    isLogin ? "Don't have an account? Sign Up"
            : "Already have an account? Login";

  document.getElementById("msg").innerHTML = "";
}

function showMessage(text, type) {
  const msg = document.getElementById("msg");
  msg.innerHTML = `<span class='${type}'>${text}</span>`;
}

/* ---- Form Submit ---- */
async function onSubmit(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (!email || !password || (!isLogin && !confirm)) {
    showMessage("Please fill in all required fields", "error");
    return;
  }

  if (isLogin) {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: selectedRole })
      });
      const data = await res.json();

      if (data.success) {
        showMessage("Login successful", "success");
        localStorage.setItem("currentUser", email);
        localStorage.setItem("currentRole", selectedRole);
        setTimeout(() => {
          window.location.href = "home.html";
        }, 1000);
      } else {
        showMessage(data.message || "Invalid email or password", "error");
      }
    } catch (err) {
      showMessage("Cannot connect to server", "error");
    }
  } else {
    if (password !== confirm) {
      showMessage("Passwords do not match", "error");
      return;
    }

    const fullName = document.getElementById("fullName").value.trim();
    const age = parseInt(document.getElementById("age").value, 10);
    const gender = document.getElementById("gender").value;
    const address = document.getElementById("address").value.trim();
    const contact = document.getElementById("contact").value.trim();
    const paymentMethod = document.getElementById("paymentMethod").value;

    if (!fullName || !age || !gender || !address || !contact || !paymentMethod) {
      showMessage("Please fill in all fields", "error");
      return;
    }

    if (age < 16) {
      showMessage("You must be at least 16 years old", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email, password, role: selectedRole,
          fullName, age, gender, address, contact, paymentMethod
        })
      });
      const data = await res.json();

      if (data.success) {
        showMessage("Signup successful! Please login", "success");
        switchForm();
      } else {
        showMessage(data.message || "Signup failed", "error");
      }
    } catch (err) {
      showMessage("Cannot connect to server", "error");
    }
  }
}

/* ---- Init ---- */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("pickFarmer").addEventListener("click", () => selectRole("farmer"));
  document.getElementById("pickCustomer").addEventListener("click", () => selectRole("customer"));
  document.getElementById("backToRole").addEventListener("click", goBackToRole);
  document.querySelector(".toggle").addEventListener("click", switchForm);
  document.getElementById("form").addEventListener("submit", onSubmit);
});
