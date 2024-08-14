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
        "https://testes-apibaoounao.iftmparacatu.app.br/proposal", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
            Accept: "application/json",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json(); // Captura a resposta de erro
        throw new Error(errorResponse.mensagem || 'Erro desconhecido');
      }

      const result = await response.json();
      console.log("Proposta enviada com sucesso:", result);
      form.reset();
      showToast(result.mensagem, "success"); // Exibe a mensagem de sucesso no toast
      window.location.href = "../../../pages/logged/my-proposal.html";
    } catch (error) {
      console.error("Erro ao enviar proposta:", error);
      showToast(error.message, "error"); // Exibe a mensagem de erro no toast
    }
  });

  // Função para mostrar o toast
  function showToast(message, type = "success") {
    const toastElement = document.getElementById("confirmationToast");
    const toastBody = document.getElementById("toast-body");

    toastBody.textContent = message;

    toastElement.classList.remove("text-success", "text-danger");
    if (type === "success") {
      toastElement.classList.add("text-primary");
    } else if (type === "error") {
      toastElement.classList.add("text-danger");
    }

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }
});