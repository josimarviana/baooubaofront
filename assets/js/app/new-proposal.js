document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("new-proposal-form");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!sessionStorage.getItem("jwt")) {
      console.error("JWT não encontrado no sessionStorage");
      return;
    }

    const formData = new FormData(form);

    try {
      const response = await fetch(
        "https://apibaoounao.iftmparacatu.app.br/proposal",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
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
      form.reset();
      window.location.href = "../../../pages/logged/my-proposal.html";
    } catch (error) {
      console.error("Erro ao enviar proposta:", error);
    }
  });
});
