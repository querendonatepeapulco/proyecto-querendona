const THEME_KEY = "inventario_querendona-theme";

let state = {
  products: [],
  movements: [],
  stockAlerts: [],
  theme: localStorage.getItem(THEME_KEY) || "light"
};
let currentUser = window.Auth.requireSession();
let activePanel = "dashboard";
let chartAnimation = 0;

const els = {
  panels: document.querySelectorAll(".panel"),
  navItems: document.querySelectorAll(".nav-item"),
  globalSearch: document.querySelector("#globalSearch"),
  categoryFilter: document.querySelector("#categoryFilter"),
  stockFilter: document.querySelector("#stockFilter"),
  productRows: document.querySelector("#productRows"),
  alertList: document.querySelector("#alertList"),
  adminAlertSection: document.querySelector("#adminAlertSection"),
  adminAlertList: document.querySelector("#adminAlertList"),
  adminAlertCount: document.querySelector("#adminAlertCount"),
  movementTimeline: document.querySelector("#movementTimeline"),
  modal: document.querySelector("#productModal"),
  form: document.querySelector("#productForm"),
  modalTitle: document.querySelector("#modalTitle"),
  toast: document.querySelector("#toast"),
  chart: document.querySelector("#categoryChart"),
  currentUserName: document.querySelector("#currentUserName"),
  currentUserRole: document.querySelector("#currentUserRole"),
  sidebarRole: document.querySelector("#sidebarRole")
};

const formatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0
});

async function init() {
  document.body.classList.toggle("dark", state.theme === "dark");
  bindEvents();
  currentUser = await window.Auth.verifySession();
  if (!currentUser) {
    window.location.replace("login.html");
    return;
  }
  await loadRemoteData();
  render();
  renderSession();
}

async function loadRemoteData() {
  const requests = [
    window.Auth.apiFetch("/api/products"),
    window.Auth.apiFetch("/api/movements")
  ];

  if (isAdmin()) {
    requests.push(window.Auth.apiFetch("/api/stock-alerts"));
  }

  const [productsResponse, movementsResponse, alertsResponse] = await Promise.all(requests);

  const productsPayload = await productsResponse.json();
  const movementsPayload = await movementsResponse.json();
  state.products = productsPayload.products || [];
  state.movements = movementsPayload.movements || [];
  state.stockAlerts = alertsResponse ? (await alertsResponse.json()).alerts || [] : [];
}

function bindEvents() {
  els.navItems.forEach((item) => {
    item.addEventListener("click", () => switchPanel(item.dataset.panel));
  });

  document.querySelector("#openProductModal").addEventListener("click", () => openModal());
  document.querySelector("#logoutButton").addEventListener("click", logout);
  document.querySelector("#closeProductModal").addEventListener("click", closeModal);
  document.querySelector("#cancelProduct").addEventListener("click", closeModal);
  document.querySelector("#themeToggle").addEventListener("click", toggleTheme);
  document.querySelector("#exportData").addEventListener("click", downloadBackup);
  document.querySelector("#downloadBackup").addEventListener("click", downloadBackup);
  document.querySelector("#resetDemo").addEventListener("click", resetDemo);
  document.querySelector("#clearMovements").addEventListener("click", clearMovements);
  document.querySelector("#restockAll").addEventListener("click", restockSuggested);
  document.querySelector("#importFile").addEventListener("change", importBackup);

  els.globalSearch.addEventListener("input", renderProducts);
  els.categoryFilter.addEventListener("change", renderProducts);
  els.stockFilter.addEventListener("change", renderProducts);
  els.form.addEventListener("submit", saveProductFromForm);
  els.modal.addEventListener("click", (event) => {
    if (event.target === els.modal) closeModal();
  });
}

async function logout() {
  await window.Auth.logout();
  closeModal();
  window.location.href = "login.html";
}

function renderSession() {
  currentUser = window.Auth.getCurrentUser();
  if (!currentUser) {
    window.location.replace("login.html");
    return;
  }

  els.currentUserName.textContent = currentUser?.name || "Sin sesion";
  els.currentUserRole.textContent = currentUser?.label || "Bloqueado";
  els.sidebarRole.textContent = currentUser ? `Rol: ${currentUser.label}` : "Sin sesion";
  if (els.adminAlertSection) {
    els.adminAlertSection.hidden = !isAdmin();
  }
  document.querySelectorAll("[data-admin-only]").forEach((node) => {
    node.disabled = !isAdmin();
  });

  const adminControls = [
    "#restockAll",
    "#exportData",
    "#downloadBackup",
    "#resetDemo",
    "#clearMovements",
    "#importFile"
  ];
  adminControls.forEach((selector) => {
    const node = document.querySelector(selector);
    if (node) node.disabled = !isAdmin();
  });
}

function switchPanel(panel) {
  activePanel = panel;
  els.panels.forEach((node) => node.classList.toggle("active", node.id === panel));
  els.navItems.forEach((node) => node.classList.toggle("active", node.dataset.panel === panel));
  if (panel === "dashboard") animateChart();
}

function isAdmin() {
  return currentUser?.role === "admin";
}

function canAddProducts() {
  return Boolean(currentUser);
}

function requireLogin() {
  if (currentUser) return true;
  showToast("Inicia sesion para usar el sistema.");
  renderSession();
  return false;
}

function requireAdmin() {
  if (isAdmin()) return true;
  showToast("Tu usuario solo puede agregar productos.");
  return false;
}

function render() {
  renderMetrics();
  renderCategoryFilter();
  renderProducts();
  renderAlerts();
  renderAdminAlerts();
  renderMovements();
  animateChart();
  renderSession();
}

function filteredProducts() {
  const query = els.globalSearch.value.trim().toLowerCase();
  const category = els.categoryFilter.value;
  const stock = els.stockFilter.value;

  return state.products.filter((product) => {
    const haystack = `${product.name} ${product.sku} ${product.category} ${product.description}`.toLowerCase();
    const queryMatch = !query || haystack.includes(query);
    const categoryMatch = category === "all" || product.category === category;
    const statusMatch = stock === "all" || getStockStatus(product).key === stock;
    return queryMatch && categoryMatch && statusMatch;
  });
}

function renderMetrics() {
  const products = state.products;
  const totalUnits = products.reduce((sum, product) => sum + Number(product.stock), 0);
  const totalValue = products.reduce((sum, product) => sum + Number(product.stock) * Number(product.price), 0);
  const categories = new Set(products.map((product) => product.category));
  const lowStock = products.filter((product) => product.stock <= product.minStock).length;

  document.querySelector("#metricProducts").textContent = products.length;
  document.querySelector("#metricUnits").textContent = totalUnits;
  document.querySelector("#metricValue").textContent = formatter.format(totalValue);
  document.querySelector("#metricLowStock").textContent = lowStock;
  document.querySelector("#metricProductsHint").textContent = `${categories.size} categorias activas`;
  document.querySelector("#sidebarProducts").textContent = `${products.length} productos`;
}

function renderCategoryFilter() {
  const current = els.categoryFilter.value;
  const categories = [...new Set(state.products.map((product) => product.category))].sort();
  els.categoryFilter.innerHTML = `<option value="all">Todas las categorias</option>`;
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    els.categoryFilter.append(option);
  });
  els.categoryFilter.value = categories.includes(current) ? current : "all";
}

function renderProducts() {
  const products = filteredProducts();
  els.productRows.innerHTML = "";

  if (!products.length) {
    els.productRows.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">No hay productos que coincidan con los filtros.</div>
        </td>
      </tr>`;
    return;
  }

  products.forEach((product) => {
    const status = getStockStatus(product);
    const stockCell = isAdmin()
      ? `
        <div class="stock-control">
          <button type="button" title="Salida" data-action="adjust" data-id="${product.id}" data-amount="-1">−</button>
          <strong>${product.stock}</strong>
          <button type="button" title="Entrada" data-action="adjust" data-id="${product.id}" data-amount="1">+</button>
        </div>`
      : `<strong>${product.stock}</strong>`;
    const actionsCell = isAdmin()
      ? `
        <div class="row-actions">
          <button type="button" title="Editar" data-action="edit" data-id="${product.id}">✎</button>
          <button type="button" title="Eliminar" data-action="delete" data-id="${product.id}">×</button>
        </div>`
      : `
        <div class="row-actions">
          <button type="button" title="Avisar agotado" data-action="report-empty" data-id="${product.id}">Avisar agotado</button>
        </div>`;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="product-cell">
          <span class="product-avatar">${initials(product.name)}</span>
          <div>
            <strong>${escapeHtml(product.name)}</strong>
            <small>${escapeHtml(product.sku || "Sin codigo")}</small>
          </div>
        </div>
      </td>
      <td>${stockCell}</td>
      <td>${escapeHtml(product.description || "Sin descripcion")}</td>
      <td>${escapeHtml(product.category)}</td>
      <td>${formatter.format(product.price)}</td>
      <td><span class="badge ${status.key}">${status.label}</span></td>
      <td>${actionsCell}</td>
    `;
    els.productRows.append(row);
  });

  els.productRows.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", handleRowAction);
  });
}

function renderAlerts() {
  const products = state.products
    .filter((product) => product.stock <= product.minStock)
    .sort((a, b) => a.stock - b.stock);

  els.alertList.innerHTML = "";

  if (!products.length) {
    els.alertList.innerHTML = `<div class="empty-state">Todo el inventario esta por encima del minimo.</div>`;
    return;
  }

  products.slice(0, 6).forEach((product) => {
    const missing = Math.max(product.minStock * 2 - product.stock, 1);
    const item = document.createElement("article");
    item.className = "alert-item";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(product.name)}</strong>
        <small>${escapeHtml(product.sku)} · ${escapeHtml(product.category)} · faltan ${missing} sugeridos</small>
      </div>
      <span class="badge ${getStockStatus(product).key}">${product.stock}/${product.minStock}</span>
    `;
    els.alertList.append(item);
  });
}

function renderAdminAlerts() {
  if (!els.adminAlertSection || !isAdmin()) return;

  const alerts = state.stockAlerts.filter((alert) => alert.status === "open");
  els.adminAlertCount.textContent = `${alerts.length} abiertos`;
  els.adminAlertList.innerHTML = "";

  if (!alerts.length) {
    els.adminAlertList.innerHTML = `<div class="empty-state">No hay avisos pendientes de capturistas.</div>`;
    return;
  }

  alerts.forEach((alert) => {
    const item = document.createElement("article");
    item.className = "alert-item";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(alert.productName)}</strong>
        <small>${escapeHtml(alert.message)} · ${escapeHtml(alert.createdByName || "Capturista")} · ${formatDate(alert.createdAt)}</small>
      </div>
      <button class="ghost-button" type="button" data-action="resolve-alert" data-id="${alert.id}">Marcar atendido</button>
    `;
    els.adminAlertList.append(item);
  });

  els.adminAlertList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", resolveStockAlert);
  });
}

async function resolveStockAlert(event) {
  if (!requireAdmin()) return;
  const id = event.currentTarget.dataset.id;
  const response = await window.Auth.apiFetch(`/api/stock-alerts/${id}/resolve`, { method: "PATCH" });
  const payload = await response.json();
  if (!response.ok) {
    showToast(payload.error || "No se pudo atender el aviso.");
    return;
  }
  await loadRemoteData();
  render();
  showToast("Aviso marcado como atendido.");
}

function renderMovements() {
  els.movementTimeline.innerHTML = "";
  const movements = [...state.movements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!movements.length) {
    els.movementTimeline.innerHTML = `<div class="empty-state">Aun no hay movimientos registrados.</div>`;
    return;
  }

  movements.slice(0, 60).forEach((movement) => {
    const item = document.createElement("article");
    item.className = "timeline-item";
    const sign = movement.quantity > 0 ? "+" : "";
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(movement.productName)} <span class="badge ${movement.quantity > 0 ? "ok" : "low"}">${sign}${movement.quantity}</span></strong>
        <small>${escapeHtml(movement.sku)} · ${escapeHtml(movement.note)} · ${formatDate(movement.createdAt)}</small>
      </div>
    `;
    els.movementTimeline.append(item);
  });
}

function animateChart() {
  if (!els.chart) return;
  chartAnimation = 0;
  requestAnimationFrame(drawCategoryChart);
}

function drawCategoryChart() {
  const ctx = els.chart.getContext("2d");
  const width = els.chart.width;
  const height = els.chart.height;
  const totals = categoryTotals();
  const max = Math.max(...totals.map((item) => item.units), 1);
  const colors = ["#156b73", "#d45b3f", "#18805a", "#af7b12", "#536b8f", "#8a5b9f"];

  ctx.clearRect(0, 0, width, height);
  ctx.font = "14px system-ui";
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--muted").trim();

  if (!totals.length) {
    ctx.fillText("Sin datos", 24, 42);
    return;
  }

  chartAnimation = Math.min(chartAnimation + 0.045, 1);
  totals.forEach((item, index) => {
    const barMaxWidth = width - 170;
    const y = 30 + index * 38;
    const barWidth = (item.units / max) * barMaxWidth * easeOut(chartAnimation);
    ctx.fillStyle = colors[index % colors.length];
    roundRect(ctx, 120, y, barWidth, 20, 6);
    ctx.fill();
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--text").trim();
    ctx.fillText(item.category, 18, y + 15);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--muted").trim();
    ctx.fillText(`${item.units} uds`, 132 + barWidth, y + 15);
  });

  if (chartAnimation < 1 && activePanel === "dashboard") {
    requestAnimationFrame(drawCategoryChart);
  }
}

function categoryTotals() {
  const totals = new Map();
  state.products.forEach((product) => {
    totals.set(product.category, (totals.get(product.category) || 0) + Number(product.stock));
  });
  return [...totals.entries()]
    .map(([category, units]) => ({ category, units }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 6);
}

function openModal(product) {
  if (!requireLogin()) return;
  if (product && !requireAdmin()) return;

  els.form.reset();
  document.querySelector("#productId").value = product?.id || "";
  els.modalTitle.textContent = product ? "Editar producto" : "Nuevo producto";

  if (product) {
    Object.entries(product).forEach(([key, value]) => {
      const field = document.querySelector(`#${key}`);
      if (field) field.value = value;
    });
  }

  els.modal.classList.add("active");
  els.modal.setAttribute("aria-hidden", "false");
  document.querySelector("#name").focus();
}

function closeModal() {
  els.modal.classList.remove("active");
  els.modal.setAttribute("aria-hidden", "true");
}

async function saveProductFromForm(event) {
  event.preventDefault();
  if (!canAddProducts()) {
    requireLogin();
    return;
  }

  const formData = new FormData(els.form);
  const id = document.querySelector("#productId").value;
  const existing = state.products.find((product) => product.id === id);

  if (existing && !requireAdmin()) {
    closeModal();
    return;
  }

  const product = {
    id,
    name: formData.get("name").trim(),
    sku: formData.get("sku").trim().toUpperCase(),
    description: formData.get("description").trim(),
    category: formData.get("category").trim(),
    supplier: "",
    stock: Number(formData.get("stock")),
    minStock: Number(formData.get("minStock")),
    cost: 0,
    price: Number(formData.get("price")),
    location: "",
    updatedAt: new Date().toISOString()
  };

  if (!product.sku) {
    product.sku = createSku(product.name, product.category);
  }

  if (!product.name || !product.category) {
    showToast("Completa nombre y categoria.");
    return;
  }

  try {
    const response = await window.Auth.apiFetch(existing ? `/api/products/${id}` : "/api/products", {
      method: existing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product)
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "No se pudo guardar el producto.");

    await loadRemoteData();
    closeModal();
    render();
    showToast(existing ? "Producto actualizado." : "Producto creado.");
  } catch (error) {
    showToast(error.message || "No se pudo guardar el producto.");
  }
}

async function handleRowAction(event) {
  const { action, id, amount } = event.currentTarget.dataset;
  const product = state.products.find((item) => item.id === id);
  if (!product) return;

  if (action === "report-empty") {
    await reportEmptyProduct(product);
    return;
  }

  if (!requireAdmin()) return;

  if (action === "edit") {
    openModal(product);
    return;
  }

  if (action === "delete") {
    if (!confirm(`Eliminar ${product.name} del inventario?`)) return;
    const response = await window.Auth.apiFetch(`/api/products/${id}`, { method: "DELETE" });
    const payload = await response.json();
    if (!response.ok) {
      showToast(payload.error || "No se pudo eliminar el producto.");
      return;
    }
    await loadRemoteData();
    render();
    showToast("Producto eliminado del inventario.");
    return;
  }

  if (action === "adjust") {
    adjustStock(product.id, Number(amount));
  }
}

async function reportEmptyProduct(product) {
  const message = prompt(`Mensaje para admin sobre ${product.name}:`, "Producto agotado o sin existencia en inventario.");
  if (message === null) return;

  const response = await window.Auth.apiFetch(`/api/products/${product.id}/stock-alert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message })
  });
  const payload = await response.json();
  if (!response.ok) {
    showToast(payload.error || "No se pudo enviar el aviso.");
    return;
  }
  showToast("Aviso enviado al admin.");
}

async function adjustStock(id, amount) {
  if (!requireAdmin()) return;
  const product = state.products.find((item) => item.id === id);
  if (!product) return;

  const response = await window.Auth.apiFetch(`/api/products/${id}/adjust`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount })
  });
  const payload = await response.json();
  if (!response.ok) {
    showToast(payload.error || "No se pudo ajustar el stock.");
    return;
  }

  await loadRemoteData();
  render();
  showToast(`${product.name}: stock ${amount > 0 ? "aumentado" : "reducido"}.`);
}

async function restockSuggested() {
  if (!requireAdmin()) return;
  const response = await window.Auth.apiFetch("/api/restock-suggested", { method: "POST" });
  const payload = await response.json();
  if (!response.ok) {
    showToast(payload.error || "No se pudo aplicar la reposicion.");
    return;
  }

  await loadRemoteData();
  render();
  showToast(payload.updated ? `Reposicion sugerida aplicada a ${payload.updated} productos.` : "No hay productos por reponer.");
}

async function clearMovements() {
  if (!requireAdmin()) return;
  if (!confirm("Limpiar todo el historial de movimientos?")) return;
  const response = await window.Auth.apiFetch("/api/movements", { method: "DELETE" });
  const payload = await response.json();
  if (!response.ok) {
    showToast(payload.error || "No se pudo limpiar el historial.");
    return;
  }
  await loadRemoteData();
  render();
  showToast("Historial de movimientos limpiado.");
}

async function resetDemo() {
  if (!requireAdmin()) return;
  if (!confirm("Restaurar los datos demo? Esto reemplaza el inventario actual.")) return;
  const response = await window.Auth.apiFetch("/api/reset-demo", { method: "POST" });
  const payload = await response.json();
  if (!response.ok) {
    showToast(payload.error || "No se pudieron restaurar los datos demo.");
    return;
  }
  await loadRemoteData();
  render();
  showToast("Datos demo restaurados.");
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, state.theme);
  document.body.classList.toggle("dark", state.theme === "dark");
  showToast(state.theme === "dark" ? "Tema oscuro activado." : "Tema claro activado.");
  render();
}

async function downloadBackup() {
  if (!requireAdmin()) return;
  const response = await window.Auth.apiFetch("/api/export");
  const payload = await response.json();
  if (!response.ok) {
    showToast(payload.error || "No se pudo exportar el respaldo.");
    return;
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `inventario_querendona-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  showToast("Respaldo descargado.");
}

function importBackup(event) {
  if (!requireAdmin()) {
    event.target.value = "";
    return;
  }
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed.products)) throw new Error("Formato invalido");
      const response = await window.Auth.apiFetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo importar el archivo.");
      await loadRemoteData();
      render();
      showToast("Respaldo importado.");
    } catch (error) {
      showToast(error.message || "No se pudo importar el archivo.");
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function getStockStatus(product) {
  if (product.stock === 0) return { key: "out", label: "Agotado" };
  if (product.stock <= product.minStock) return { key: "low", label: "Bajo" };
  return { key: "ok", label: "Saludable" };
}

function createSku(name, category) {
  const prefix = `${category} ${name}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 16)
    .toUpperCase();
  return `${prefix || "PROD"}-${Date.now().toString().slice(-6)}`;
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => els.toast.classList.remove("show"), 2400);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function easeOut(value) {
  return 1 - Math.pow(1 - value, 3);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

init();
