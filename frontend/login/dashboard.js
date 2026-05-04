import { getFarmers, getCustomers } from '../js/userService.js';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatPayment(val) {
  const map = { cash: "Cash", card: "Credit / Debit Card", bank_transfer: "Bank Transfer", mobile_pay: "Mobile Pay" };
  return map[val] || val;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

function renderTable(tableId, emptyId, data) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  const emptyMsg = document.getElementById(emptyId);
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    emptyMsg.classList.remove("hidden");
    return;
  }

  emptyMsg.classList.add("hidden");

  data.forEach((user, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${user.fullName || "—"}</td>
      <td>${user.email}</td>
      <td>${user.age || "—"}</td>
      <td>${capitalize(user.gender) || "—"}</td>
      <td>${user.address || "—"}</td>
      <td>${user.contact || user.phone || "—"}</td>
      <td>${formatPayment(user.paymentMethod)}</td>
      <td>${formatDate(user.createdAt)}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadData() {
  try {
    const [farmersData, customersData] = await Promise.all([
      getFarmers(),
      getCustomers(),
    ]);

    renderTable("farmersTable", "farmersEmpty", farmersData.data);
    renderTable("customersTable", "customersEmpty", customersData.data);
  } catch (err) {
    console.error("Failed to load data:", err);
  }
}

/* Tab switching */
document.addEventListener("DOMContentLoaded", () => {
  const tabFarmers = document.getElementById("tabFarmers");
  const tabCustomers = document.getElementById("tabCustomers");
  const farmersSection = document.getElementById("farmersSection");
  const customersSection = document.getElementById("customersSection");

  tabFarmers.addEventListener("click", () => {
    tabFarmers.classList.add("active");
    tabCustomers.classList.remove("active");
    farmersSection.classList.remove("hidden");
    customersSection.classList.add("hidden");
  });

  tabCustomers.addEventListener("click", () => {
    tabCustomers.classList.add("active");
    tabFarmers.classList.remove("active");
    customersSection.classList.remove("hidden");
    farmersSection.classList.add("hidden");
  });

  loadData();
});
