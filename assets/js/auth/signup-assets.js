import config from "../environments/config.js";
import showToast from "../app/toast.js";

const apiUrl = config.api + "/user";
document.getElementById("show-password").addEventListener("click", function () {
  var passwordField = document.getElementById("signup-password");
  var passwordIcon = document.getElementById("show-pass-icon");
  var passwordFieldType = passwordField.getAttribute("type");
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

const signupForm = document.getElementById("signup-form");
const submitButton = signupForm.querySelector('button[type="submit"]');

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  submitButton.disabled = true;
  submitButton.innerHTML = `
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cadastrando...`;

  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById(
    "signup-confirm-password"
  ).value;
  const selectedType = document.querySelector('input[name="type"]:checked');
  const type = selectedType ? selectedType.value : "";

  if (!name.trim()) {
    showToast("Nome não pode ser vazio", "error");
    return;
  }
  if (password !== confirmPassword) {
    showToast(
      "As senhas não coincidem. Por favor, verifique e tente novamente.",
      "error"
    );
    return;
  }

  const formData = {
    email,
    name,
    type,
    password,
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.status === 201) {
      localStorage.setItem("userEmail", email);
      window.location.href = "../../../pages/messages/email.html";
    } else {
      const errorResponse = await response.json();

      let errorMessage = errorResponse.mensagem;
      if (errorResponse.detalhes) {
        const firstKey = Object.keys(errorResponse.detalhes)[0];
        errorMessage = errorResponse.detalhes[firstKey];
      }

      throw new Error(errorMessage || "Erro desconhecido");
    }
  } catch (error) {
    showToast(error, "error");
    resetButton();
  }
});

function resetButton() {
  submitButton.disabled = false;
  submitButton.innerHTML = "Cadastrar-se";
}
