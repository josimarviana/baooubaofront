document.addEventListener("DOMContentLoaded", function () {
  const proposalModal = document.getElementById("proposalModal");
  const jwt = sessionStorage.getItem("jwt");
  if (!jwt) {
    console.error("Usuário não autenticado. Redirecionando para o login.");
    window.location.href = "../errors/404.html"; // Redirecionar para a página de login
    return; // Interrompe a execução da função
  }
});
proposalModal.addEventListener("show.bs.modal", async function (event) {
  const button = event.relatedTarget;
  const id = button.getAttribute("data-proposal-id");

  const apiUrl = `https://apibaoounao.iftmparacatu.app.br/proposal/${id}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
  } catch (Error) {}
});
