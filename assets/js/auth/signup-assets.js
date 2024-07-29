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
const signupForm = document.querySelector(".auth-signup-form");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirmPassword = document
    .getElementById("signup-confirm-password")
    .value.trim();
  const role = "ROLE_USER";

  // Coleta dos tipos de usuário
  const typeElements = e.target.querySelectorAll('input[name="type[]"]');
  const typeValues = [...typeElements]
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value.toUpperCase());

  // Verifica se algum tipo de usuário foi selecionado
  const type = typeValues.length > 0 ? typeValues[0] : null;

  const errors = [];

  if (!name) errors.push("O campo nome é obrigatório.");
  if (!email) errors.push("O campo email é obrigatório.");
  if (!password) errors.push("O campo senha é obrigatório.");
  if (password !== confirmPassword) errors.push("As senhas não coincidem.");
  if (!type) errors.push("O campo tipo de usuário é obrigatório.");

  //   const passwordRegex =
  //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  //   if (!passwordRegex.test(password)) {
  //     errors.push(
  //       "A senha deve ter pelo menos 8 caracteres, incluindo uma letra maíuscula, um número e um caractere especial."
  //     );
  //   }

  // Se houver erros, exibe alertas e retorna
  if (errors.length > 0) {
    alert(errors.join("\n"));
    return;
  }
  try {
    const response = await fetch(
      "https://apibaoounao.iftmparacatu.app.br/user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name,
          type,
          password,
          role,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao cadastrar usuário");
    }

    // Pode ser necessário um tratamento adicional baseado na resposta do servidor
    window.location.href = "../../../pages/auth/login.html";
  } catch (error) {
    console.error("Erro durante o cadastro:", error);
    alert(error.message);
  }
});
