document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("fh_loggedIn") === "true";
  const loginModal = document.getElementById("loginModal");
  const profilePage = document.getElementById("profilePage");

  if (!isLoggedIn) {
    loginModal.style.display = "flex";
    profilePage.style.display = "none";
  } else {
    loginModal.style.display = "none";
    profilePage.style.display = "block";
    loadProfile();
    loadPosts();
  }

  // Login redirect
  document.getElementById("goLoginBtn").addEventListener("click", () => {
    window.location.href = "login/login.html";
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("fh_loggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("fh_role");
    window.location.href = "index.html";
  });

  // Edit Profile
  document.getElementById("editProfileBtn").addEventListener("click", () => {
    const profile = JSON.parse(localStorage.getItem("fh_profile")) || {};
    document.getElementById("editName").value = profile.name || "";
    document.getElementById("editRole").value = profile.role || "Farmer";
    document.getElementById("editLocation").value = profile.location || "";
    document.getElementById("editBio").value = profile.bio || "";
    document.getElementById("editPhone").value = profile.phone || "";
    document.getElementById("editFarmName").value = profile.farmName || "";
    document.getElementById("editProducts").value = profile.products || "";
    document.getElementById("editModal").style.display = "flex";
  });

  // Cancel Edit
  document.getElementById("cancelEditBtn").addEventListener("click", () => {
    document.getElementById("editModal").style.display = "none";
  });

  // Save Profile
  document.getElementById("editForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const profile = {
      name: document.getElementById("editName").value.trim(),
      role: document.getElementById("editRole").value,
      location: document.getElementById("editLocation").value.trim(),
      bio: document.getElementById("editBio").value.trim(),
      phone: document.getElementById("editPhone").value.trim(),
      farmName: document.getElementById("editFarmName").value.trim(),
      products: document.getElementById("editProducts").value.trim()
    };
    localStorage.setItem("fh_profile", JSON.stringify(profile));
    document.getElementById("editModal").style.display = "none";
    loadProfile();
  });

  // Cover photo upload
  document.getElementById("coverInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById("coverImg").src = ev.target.result;
      document.getElementById("coverImg").style.display = "block";
      document.getElementById("coverPlaceholder").style.display = "none";
      localStorage.setItem("fh_cover", ev.target.result);
    };
    reader.readAsDataURL(file);
  });

  // Avatar upload
  document.getElementById("avatarInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById("avatarImg").src = ev.target.result;
      document.getElementById("avatarImg").style.display = "block";
      document.getElementById("avatarPlaceholder").style.display = "none";
      localStorage.setItem("fh_avatar", ev.target.result);
    };
    reader.readAsDataURL(file);
  });

  // Post submission
  document.getElementById("submitPostBtn").addEventListener("click", () => {
    const text = document.getElementById("postInput").value.trim();
    const imageInput = document.getElementById("postImageInput");
    if (!text && !imageInput.files[0]) return;

    const posts = JSON.parse(localStorage.getItem("fh_posts")) || [];
    const post = { text, date: new Date().toISOString(), id: Date.now() };

    if (imageInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        post.image = ev.target.result;
        posts.unshift(post);
        localStorage.setItem("fh_posts", JSON.stringify(posts));
        document.getElementById("postInput").value = "";
        document.getElementById("postImageName").textContent = "";
        imageInput.value = "";
        loadPosts();
      };
      reader.readAsDataURL(imageInput.files[0]);
    } else {
      posts.unshift(post);
      localStorage.setItem("fh_posts", JSON.stringify(posts));
      document.getElementById("postInput").value = "";
      loadPosts();
    }
  });

  // Post image name preview
  document.getElementById("postImageInput").addEventListener("change", (e) => {
    const name = e.target.files[0] ? e.target.files[0].name : "";
    document.getElementById("postImageName").textContent = name;
  });
});

function loadProfile() {
  const profile = JSON.parse(localStorage.getItem("fh_profile")) || {};
  const currentUser = localStorage.getItem("currentUser") || "User";

  document.getElementById("profileName").textContent = profile.name || currentUser;
  document.getElementById("profileRole").textContent = profile.role || localStorage.getItem("fh_role") || "Farmer";
  document.getElementById("profileLocation").textContent = profile.location ? "📍 " + profile.location : "📍 Add your location";
  document.getElementById("bioText").textContent = profile.bio || 'No bio yet. Click "Edit Profile" to add one.';
  document.getElementById("farmNameDisplay").textContent = profile.farmName || "Not set";
  document.getElementById("productsDisplay").textContent = profile.products || "Not set";
  document.getElementById("phoneDisplay").textContent = profile.phone || "Not set";

  // Load cover
  const cover = localStorage.getItem("fh_cover");
  if (cover) {
    document.getElementById("coverImg").src = cover;
    document.getElementById("coverImg").style.display = "block";
    document.getElementById("coverPlaceholder").style.display = "none";
  }

  // Load avatar
  const avatar = localStorage.getItem("fh_avatar");
  if (avatar) {
    document.getElementById("avatarImg").src = avatar;
    document.getElementById("avatarImg").style.display = "block";
    document.getElementById("avatarPlaceholder").style.display = "none";
    document.getElementById("postAvatarSmall").innerHTML = `<img src="${avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
  }
}

function loadPosts() {
  const posts = JSON.parse(localStorage.getItem("fh_posts")) || [];
  const feed = document.getElementById("postsFeed");
  const profile = JSON.parse(localStorage.getItem("fh_profile")) || {};
  const name = profile.name || localStorage.getItem("currentUser") || "User";

  document.getElementById("postCount").textContent = posts.length;

  feed.innerHTML = posts.map(p => `
    <div class="post-card">
      <div class="post-header">
        <strong>${name}</strong>
        <small>${new Date(p.date).toLocaleDateString()}</small>
        <button class="delete-post-btn" data-id="${p.id}" title="Delete">✕</button>
      </div>
      ${p.text ? `<p class="post-text">${p.text}</p>` : ""}
      ${p.image ? `<img src="${p.image}" class="post-image" alt="Post image" />` : ""}
    </div>
  `).join("");

  // Delete handlers
  feed.querySelectorAll(".delete-post-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      const updated = posts.filter(p => p.id !== id);
      localStorage.setItem("fh_posts", JSON.stringify(updated));
      loadPosts();
    });
  });
}
