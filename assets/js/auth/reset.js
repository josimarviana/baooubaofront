import config from "../environments/config.js";
import showToast from "../app/toast.js";

const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");
const apiUrl = `${config.api}/user/email/senha/${token}`;

document.getElementById("show-password").addEventListener("click", function () {
  const passwordField = document.getElementById("reset-password");
  const passwordIcon = document.getElementById("show-pass-icon");
  const passwordFieldType = passwordField.getAttribute("type");

  if (passwordFieldType === "password") {
    passwordField.setAttribute("type", "text");
    passwordIcon.classList.remove("fa-eye-slash");
    passwordIcon.classList.add("fa-eye");
  } else {
    passwordField.setAttribute("type", "password");
    passwordIcon.classList.remove("fa-eye");
    passwordIcon.classList.add("fa-eye-slash");
  }
});

const resetForm = document.querySelector("#resetForm");

resetForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const password = document.querySelector("#reset-password").value;
  const confirmPassword = document.querySelector(
    "#reset-confirm-password"
  ).value;

  if (password !== confirmPassword) {
    showToast(
      "As senhas não coincidem. Por favor, verifique e tente novamente.",
      "error"
    );
    return;
  }

  const formData = { password, confirmPassword };

  try {
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      showToast("Senha alterada com sucesso!", "success");
      resetForm.reset();
      setTimeout(() => {
        window.location.href = "/pages/auth/login.html";
      }, 2000);
    } else {
      const errorResponse = await response.json();
      throw new Error(errorResponse.message || "Erro ao redefinir a senha.");
    }
  } catch (error) {
    console.error("Erro durante a redefinição de senha:", error);
    showToast(error.message, "error");
  }
});
