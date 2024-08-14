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
const signupName = document.getElementById("signup-name");
const signupEmail = document.getElementById("signup-email");
const signupPassword = document.getElementById("signup-password");
const signupConfirmPassword = document.getElementById(
  "signup-confirm-password"
);

const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");
const emailError = document.getElementById("emailError");
const typeError = document.getElementById("typeError");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();

  passwordError.textContent = "";
  confirmPasswordError.textContent = "";
  emailError.textContent = "";
  typeError.textContent = "";

  const name = signupName.value;
  const email = signupEmail.value;
  const password = signupPassword.value;
  const confirmPassword = signupConfirmPassword.value;

  const selectedType = document.querySelector('input[name="type"]:checked');
  const type = selectedType ? selectedType.value : "";

  let isValid = true;

  if (password.length < 8) {
    passwordError.textContent = "A senha deve ter no mínimo 8 caracteres.";
    isValid = false;
  }
  if (password !== confirmPassword) {
    confirmPasswordError.textContent = "As senhas não coincidem.";
    isValid = false;
  }
  if (!emailRegex.test(email)) {
    emailError.textContent = "Email inválido.";
    isValid = false;
  }
  if (!type) {
    typeError.textContent = "Selecione um tipo de usuário.";
    isValid = false;
  }

  if (isValid) {
    const formData = {
      email,
      name,
      type,
      password,
    };

    fetch("https://testes-apibaoounao.iftmparacatu.app.br/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Erro ao enviar dados para a API: ${text}`);
          });
        }
        // Verificar se a resposta possui corpo e tratar conforme
        return response.text().then((text) => {
          if (text) {
            try {
              const data = JSON.parse(text);
              console.log("Dados enviados com sucesso: ", data);
            } catch (e) {
              console.warn("Resposta da API não é JSON válido: ", text);
            }
          } else {
            console.log("Dados enviados com sucesso, mas sem resposta JSON.");
          }
          localStorage.setItem("userEmail", email);
          window.location.href = "../../../pages/messages/confirmation.html";
        });
      })
      .catch((error) => {
        console.error("Erro: ", error);
      });
  }
});