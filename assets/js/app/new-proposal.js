document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("new-proposal-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const jwt = sessionStorage.getItem("jwt");
    if (!jwt) {
      console.error("JWT não encontrado no sessionStorage");
      return;
    }

    // Cria o FormData a partir do formulário
    const formData = new FormData(form);

    try {
      const response = await fetch(
        "https://apibaoounao.iftmparacatu.app.br/proposal",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`,
            Accept: "application/json",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Proposta enviada com sucesso:", result);
      // Redireciona ou limpa o formulário conforme necessário
      form.reset();
      window.location.href = "../../../pages/logged/my-proposal.html"; // Substitua pelo caminho correto para redirecionar
    } catch (error) {
      console.error("Erro ao enviar proposta:", error);
    }
  });
});
