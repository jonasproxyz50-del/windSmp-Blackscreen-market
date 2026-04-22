const defaultProducts = [
  {
    name: "Skeleton Spawner",
    price: 5000000,
    tag: "Spawner",
    description: "Ein Skeleton Spawner fuer deinen Ingame-Fortschritt auf WindSMP."
  }
];

const defaultAccounts = [
  {
    username: "admin",
    password: "JonasPro11124",
    discord: "windsmp-admin",
    role: "admin"
  }
];

const storageKeys = {
  products: "windsmp-products",
  accounts: "windsmp-accounts",
  currentUser: "windsmp-current-user"
};

const productList = document.querySelector("#product-list");
const adminProductList = document.querySelector("#admin-product-list");
const accountList = document.querySelector("#account-list");
const currentUserLabel = document.querySelector("#current-user");
const logoutButton = document.querySelector("#logout-button");
const adminPanel = document.querySelector("#admin-panel");
const adminSection = document.querySelector("#admin-section");
const adminNavLink = document.querySelector("#admin-nav-link");
const authSection = document.querySelector("#auth-section");
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const productForm = document.querySelector("#product-form");
const toast = document.querySelector("#toast");

function loadData(key, fallback) {
  const savedValue = localStorage.getItem(key);
  return savedValue ? JSON.parse(savedValue) : fallback;
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let products = loadData(storageKeys.products, defaultProducts);
let accounts = loadData(storageKeys.accounts, defaultAccounts);
let currentUser = loadData(storageKeys.currentUser, null);

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2600);
}

function formatPrice(value) {
  return `$${Math.round(value).toLocaleString("de-DE")}`;
}

function renderProducts() {
  productList.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-head">
        <span class="product-tag">${product.tag}</span>
        <span class="price">${formatPrice(product.price)}</span>
      </div>
      <div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
      </div>
      <div class="product-footer">
        <span>Im BlackScreen Market verfuegbar</span>
        <a class="button secondary" href="https://discord.gg/4DNKHYaqP" target="_blank" rel="noreferrer">Kaufen und Ticket in DC erstellen</a>
      </div>
    `;

    productList.appendChild(card);
  });
}

function renderAccounts() {
  accountList.innerHTML = "";

  accounts.forEach((account) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <strong>${account.username}</strong><br>
      Discord: ${account.discord}<br>
      Rolle: ${account.role}
    `;
    accountList.appendChild(item);
  });
}

function renderAdminProducts() {
  adminProductList.innerHTML = "";

  products.forEach((product, index) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <div class="list-row">
        <div class="list-copy">
          <strong>${product.name}</strong><br>
          Preis: ${formatPrice(product.price)}<br>
          Kategorie: ${product.tag}
        </div>
        <button class="button danger remove-product-button" type="button" data-index="${index}">
          Entfernen
        </button>
      </div>
    `;
    adminProductList.appendChild(item);
  });
}

function renderCurrentUser() {
  if (!currentUser) {
    currentUserLabel.textContent = "Nicht eingeloggt";
    logoutButton.classList.add("hidden");
    adminPanel.classList.add("hidden");
    adminSection.classList.add("hidden");
    adminNavLink.classList.add("hidden");
    authSection.classList.remove("hidden");
    return;
  }

  currentUserLabel.textContent = `${currentUser.username} ist eingeloggt (${currentUser.role})`;
  logoutButton.classList.remove("hidden");
  authSection.classList.add("hidden");

  if (currentUser.role === "admin") {
    adminNavLink.classList.remove("hidden");
    adminSection.classList.remove("hidden");
    adminPanel.classList.remove("hidden");
  } else {
    adminNavLink.classList.add("hidden");
    adminSection.classList.add("hidden");
    adminPanel.classList.add("hidden");
  }
}

function persistAll() {
  saveData(storageKeys.products, products);
  saveData(storageKeys.accounts, accounts);
  saveData(storageKeys.currentUser, currentUser);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  const username = formData.get("username").trim();
  const password = formData.get("password").trim();

  const account = accounts.find((entry) => (
    entry.username === username && entry.password === password
  ));

  if (!account) {
    showToast("Login fehlgeschlagen. Bitte pruefe Benutzername und Passwort.");
    return;
  }

  currentUser = account;
  persistAll();
  renderCurrentUser();
  loginForm.reset();
  showToast(`Willkommen zurueck, ${account.username}.`);
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(registerForm);
  const username = formData.get("username").trim();
  const discord = formData.get("discord").trim();
  const password = formData.get("password").trim();

  const usernameExists = accounts.some((account) => account.username === username);

  if (usernameExists) {
    showToast("Dieser Benutzername ist schon vergeben.");
    return;
  }

  const newAccount = {
    username,
    discord,
    password,
    role: "user"
  };

  accounts.push(newAccount);
  currentUser = newAccount;
  persistAll();
  renderAccounts();
  renderCurrentUser();
  registerForm.reset();
  showToast("Dein Account wurde erstellt und eingeloggt.");
});

productForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!currentUser || currentUser.role !== "admin") {
    showToast("Nur Admins duerfen Produkte anlegen.");
    return;
  }

  const formData = new FormData(productForm);
  const newProduct = {
    name: formData.get("name").trim(),
    price: Number(formData.get("price")),
    tag: formData.get("tag").trim(),
    description: formData.get("description").trim()
  };

  products.unshift(newProduct);
  persistAll();
  renderProducts();
  renderAdminProducts();
  productForm.reset();
  showToast(`Produkt "${newProduct.name}" wurde gespeichert.`);
});

adminProductList.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".remove-product-button");

  if (!removeButton) {
    return;
  }

  if (!currentUser || currentUser.role !== "admin") {
    showToast("Nur Admins duerfen Produkte entfernen.");
    return;
  }

  const index = Number(removeButton.dataset.index);
  const removedProducts = products.splice(index, 1);

  if (removedProducts.length === 0) {
    showToast("Produkt konnte nicht entfernt werden.");
    return;
  }

  persistAll();
  renderProducts();
  renderAdminProducts();
  showToast(`Produkt "${removedProducts[0].name}" wurde entfernt.`);
});

logoutButton.addEventListener("click", () => {
  currentUser = null;
  persistAll();
  renderCurrentUser();
  showToast("Du wurdest ausgeloggt.");
});

renderProducts();
renderAdminProducts();
renderAccounts();
renderCurrentUser();
