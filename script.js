let accounts = JSON.parse(localStorage.getItem("bankAccounts")) || [];
let currentUser = null;
let currentAccount = null;

function saveAccounts() {
  localStorage.setItem("bankAccounts", JSON.stringify(accounts));
}

function showNotification(msg, type = "success") {
  const n = document.getElementById("notification");
  n.textContent = msg;
  n.className = `notification ${type} show`;
  setTimeout(() => n.classList.remove("show"), 2500);
}

// Create Account
document.getElementById("createAccountForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const acc = {
    name: document.getElementById("name").value.trim(),
    dob: document.getElementById("dob").value,
    phone: document.getElementById("phone").value,
    accountType: document.getElementById("accountType").value,
    address: document.getElementById("address").value.trim(),
    ifsc: document.getElementById("ifsc").value.toUpperCase(),
    balance: parseFloat(document.getElementById("initialBalance").value),
    pin: document.getElementById("pin").value,
    accountNumber: Date.now(),
    createdDate: new Date().toLocaleDateString(),
    transactions: []
  };

  if (acc.balance < 100) return showNotification("Minimum ₹100 required", "error");

  accounts.push(acc);
  saveAccounts();
  e.target.reset();
  window.scrollTo(0, 0);
  showNotification(`✅ Account Created! No: ${acc.accountNumber}`);
});

// Access Account
document.getElementById("accessForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("accessName").value.trim().toLowerCase();
  const pin = document.getElementById("accessPin").value;
  const found = accounts.filter(a => a.name.toLowerCase() === name && a.pin === pin);
  if (found.length === 0) return showNotification("Invalid credentials", "error");

  currentUser = name;
  document.getElementById("loginCard").classList.add("hidden");
  document.getElementById("manageCard").classList.remove("hidden");
  document.getElementById("welcomeMessage").textContent = `Welcome, ${found[0].name}`;
  displayAccounts(found);
});

function displayAccounts(list) {
  const c = document.getElementById("accountsList");
  if (list.length === 0) return c.innerHTML = "<p>No accounts found.</p>";
  c.innerHTML = list.map(a => `
    <div class="account-card" onclick="openModal(${a.accountNumber})">
      <button class="delete-btn" onclick="event.stopPropagation();deleteAccount(${a.accountNumber})">🗑️</button>
      <h3>${a.name}</h3>
      <p>Acc No: ${a.accountNumber}</p>
      <p>Type: ${a.accountType}</p>
      <h3>₹${a.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</h3>
    </div>
  `).join('');
}

function deleteAccount(num) {
  if (!confirm("Delete this account?")) return;
  accounts = accounts.filter(a => a.accountNumber !== num);
  saveAccounts();
  const userAcc = accounts.filter(a => a.name.toLowerCase() === currentUser);
  displayAccounts(userAcc);
  showNotification("Account deleted");
}

function openModal(num) {
  currentAccount = accounts.find(a => a.accountNumber === num);
  document.getElementById("accountDetails").innerHTML = `
    <p><b>Account:</b> ${currentAccount.accountNumber}</p>
    <p><b>Type:</b> ${currentAccount.accountType}</p>
    <p><b>Created:</b> ${currentAccount.createdDate}</p>
    <p><b>IFSC:</b> ${currentAccount.ifsc}</p>
    <p><b>Balance:</b> ₹${currentAccount.balance.toLocaleString('en-IN',{minimumFractionDigits:2})}</p>
  `;
  renderTransactions();
  document.getElementById("accountModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("accountModal").classList.add("hidden");
}

function renderTransactions() {
  const list = document.getElementById("transactionHistory");
  if (currentAccount.transactions.length === 0) {
    list.innerHTML = "<li>No transactions yet</li>";
  } else {
    list.innerHTML = currentAccount.transactions.map(t =>
      `<li>${t.date} — ${t.type}: ₹${t.amount}</li>`).join('');
  }
}

function deposit() {
  const amt = parseFloat(document.getElementById("transactionAmount").value);
  if (!amt || amt <= 0) return showNotification("Invalid amount", "error");
  currentAccount.balance += amt;
  currentAccount.transactions.push({type: "Deposit", amount: amt, date: new Date().toLocaleString()});
  updateAccount();
  document.getElementById("transactionAmount").value = "";
  showNotification(`Deposited ₹${amt}`);
}

function withdraw() {
  const amt = parseFloat(document.getElementById("transactionAmount").value);
  if (!amt || amt <= 0) return showNotification("Invalid amount", "error");
  if (amt > currentAccount.balance) return showNotification("Insufficient balance!", "error");
  currentAccount.balance -= amt;
  currentAccount.transactions.push({type: "Withdraw", amount: amt, date: new Date().toLocaleString()});
  updateAccount();
  document.getElementById("transactionAmount").value = "";
  showNotification(`Withdrawn ₹${amt}`);
}

function updateAccount() {
  const i = accounts.findIndex(a => a.accountNumber === currentAccount.accountNumber);
  accounts[i] = currentAccount;
  saveAccounts();
  const userAcc = accounts.filter(a => a.name.toLowerCase() === currentUser);
  displayAccounts(userAcc);
  renderTransactions();
}

function logout() {
  currentUser = null;
  document.getElementById("manageCard").classList.add("hidden");
  document.getElementById("loginCard").classList.remove("hidden");
  showNotification("Logged out");
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  localStorage.setItem("darkTheme", dark);
  document.querySelector(".theme-toggle").textContent = dark ? "☀️" : "🌙";
}

(function init() {
  if (localStorage.getItem("darkTheme") === "true") {
    document.body.classList.add("dark");
    document.querySelector(".theme-toggle").textContent = "☀️";
  }
})();
