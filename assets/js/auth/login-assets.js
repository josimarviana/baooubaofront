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
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // impede o comportamento padrão de envio do form

    const email = document.getElementById("login-email");
    const password = document.getElementById("login-password");
    try {
        const response = await fetch('https://apibaoounao.iftmparacatu.app.br/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password }),
            credentials: 'include' // Necessário para enviar cookies HttpOnly
        });

        if (response.ok) {
            // Redirecione ou atualize a interface conforme necessário
            window.location.href = '/index.html';
        } else {
            // Lidar com erros, como credenciais inválidas
            alert('Login falhou. Verifique suas credenciais.');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
});