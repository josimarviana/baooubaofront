import config from '../environments/config.js';
import showToast from '../app/toast.js'; // Importa a função de toast

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

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("signup-confirm-password").value;
  const selectedType = document.querySelector('input[name="type"]:checked');
  const type = selectedType ? selectedType.value : "";

  if (!name.trim()) {
    showToast("Nome não pode ser vazio", "error");
    return;
  }
  if (password !== confirmPassword) {
    showToast("As senhas não coincidem. Por favor, verifique e tente novamente.", "error");
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
    console.log(response.status);
    if (response.status === 201) {
      console.log("Cadastro realizado com sucesso.");
      localStorage.setItem("userEmail", email);
      window.location.href = "../../../pages/messages/confirmation.html";
    } else {
      const errorResponse = await response.json();
      if (errorResponse.detalhes) {
        const errorMessages = Object.values(errorResponse.detalhes).join(" ");
        throw new Error(errorMessages);
      } else {
        throw new Error(errorResponse.mensagem || "Falha no cadastro. Verifique os dados e tente novamente.");
      }
    }
  } catch (error) {
    showToast(error.message, "error");
  }
});