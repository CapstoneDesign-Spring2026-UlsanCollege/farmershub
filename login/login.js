let isLogin = true;

function switchForm() {
  isLogin = !isLogin;

  document.getElementById("title").innerText = isLogin ? "Login" : "Sign Up";
  document.getElementById("btn").innerText = isLogin ? "Login" : "Sign Up";
  document.getElementById("confirmBox").style.display = isLogin ? "none" : "block";
  document.querySelector(".toggle").innerText =
    isLogin ? "Don't have an account? Sign Up"
            : "Already have an account? Login";

  document.getElementById("msg").innerHTML = "";
}

function showMessage(text, type) {
  const msg = document.getElementById("msg");
  msg.innerHTML = `<span class='${type}'>${text}</span>`;
}

function onSubmit(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (!email || !password || (!isLogin && !confirm)) {
    showMessage("Please fill in all required fields", "error");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];

  if (isLogin) {
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      showMessage("Login successful", "success");
      localStorage.setItem("currentUser", email);
      localStorage.setItem("fh_loggedIn", "true");

      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1000);
    } else {
      showMessage("Invalid email or password", "error");
    }
  } else {
    if (password !== confirm) {
      showMessage("Passwords do not match", "error");
      return;
    }

    if (users.find(u => u.email === email)) {
      showMessage("User already exists", "error");
      return;
    }

    users.push({ email: email, password: password });
    localStorage.setItem("users", JSON.stringify(users));

    showMessage("Signup successful! Please login", "success");
    switchForm();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".toggle").addEventListener("click", switchForm);
  document.getElementById("form").addEventListener("submit", onSubmit);
});
