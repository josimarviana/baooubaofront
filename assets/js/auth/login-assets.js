document.getElementById("show-password").addEventListener("click", function () {
  var passwordField = document.getElementById("login-password");
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

const loginForm = document.querySelector("#loginForm");
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.querySelector("#login-email").value;
  const password = document.querySelector("#login-password").value;
  const data = {
    email,
    password,
  };

  fetch("https://apibaoounao.iftmparacatu.app.br/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          "Falha na autenticação. Verifique suas credenciais e tente novamente."
        );
      }
      return response.json();
    })
    .then((data) => {
      const token = data.token;
      sessionStorage.setItem("jwt", token);
      window.location.href = "../../../pages/logged/home.html";
    })
    .catch((error) => {
      console.error("Erro durante o login:", error);
      alert(error.message);
    });
});

