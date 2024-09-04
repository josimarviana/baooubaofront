import config from "../environments/config.js";
import showToast from "../app/toast.js";

const apiUrl = config.api + "/user/login";

document.getElementById("show-password").addEventListener("click", function () {
  const passwordField = document.getElementById("login-password");
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

const loginForm = document.querySelector("#loginForm");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.querySelector("#login-email").value;
  const password = document.querySelector("#login-password").value;
  const data = { email, password };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(
        errorResponse.mensagem ||
          "Falha na autenticação. Verifique suas credenciais e tente novamente."
      );
    }

    const responseData = await response.json();
    const token = responseData.token;
    sessionStorage.setItem("jwt", token);

    const jwt = sessionStorage.getItem("jwt");
    const decodedToken = parseJwt(jwt);
    sessionStorage.setItem("roles", decodedToken.roles.join(", "));
    
    loginForm.reset();
    window.location.href = "../../../pages/logged/home.html";
  } catch (error) {
    console.error("Erro durante o login:", error);
    showToast(error.message, "error");
  }
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
