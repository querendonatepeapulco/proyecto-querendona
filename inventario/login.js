const loginForm = document.querySelector("#loginForm");
const toast = document.querySelector("#toast");

if (window.Auth.getCurrentUser()) {
  window.location.replace("index.html");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);

  try {
    await window.Auth.authenticate(formData.get("loginUser"), formData.get("loginPassword"));
    window.location.href = "index.html";
  } catch (error) {
    showToast(error.message || "Usuario o contrasena incorrectos.");
  }
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2400);
}
