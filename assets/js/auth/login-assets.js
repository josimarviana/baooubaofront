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
const errorMessage = document.getElementById("loginError");

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

      const jwt = sessionStorage.getItem("jwt");
      const decodedToken = parseJwt(jwt);

      console.log("Decoded JWT:", decodedToken);
      sessionStorage.setItem("roles", decodedToken.roles.join(", "));

      errorMessage.textContent = "";
      loginForm.reset();
      window.location.href = "../../../pages/logged/home.html";
    })
    .catch((error) => {
      console.error("Erro durante o login:", error);

      errorMessage.textContent =
        "Falha na autenticação. Verifique suas credenciais e tente novamente.";
    });

  function parseJwt(token) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  }
});
