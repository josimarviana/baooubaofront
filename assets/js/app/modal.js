document.addEventListener("DOMContentLoaded", function () {
  const createCycleModal = document.getElementById("createCycleModal");

  if (!sessionStorage.getItem("jwt")) {
    console.error("Usuário não autenticado. Redirecionando para o login.");
    window.location.href = "../errors/404.html";
    return;
  }

  // Função para criar um ciclo
  async function createCycle(cycleData) {
    const apiUrl = "https://apibaoounao.iftmparacatu.app.br/cycle"; // URL correspondente

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(cycleData),
      });

      console.log("Status da resposta:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao enviar dados: ${errorText}`);
      }

      // Se a resposta for 201, simplesmente retorne um valor null ou um objeto indicando sucesso
      if (response.status === 201) {
        showToast("Ciclo criado com sucesso!");
        return null; // Retorna null pois não há corpo na resposta
      }

      // Se a resposta é em JSON, processa normalmente
      return await response.json();
    } catch (error) {
      console.error("Erro durante o cadastro do ciclo:", error);
      showToast(
        "Erro ao cadastrar o ciclo. Verifique os dados e tente novamente."
      );
      return null; // Retorne null em caso de erro
    }
  }

  // Adiciona evento de submissão ao formulário de criação de ciclo
  document
    .getElementById("createCycleForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = event.target.querySelector("button[type='submit']");
      submitButton.disabled = true; // Desabilita o botão enquanto processa

      const cycleData = {
        title: document.getElementById("cycleTitle").value.trim(),
        startDate: document.getElementById("startDate").value.trim(),
        finishDate: document.getElementById("endDate").value.trim(),
      };

      const newCycle = await createCycle(cycleData);
      if (newCycle) {
        loadCycles(); // Atualiza a lista de ciclos

        // Esconde o modal após um curto período
        setTimeout(() => {
          const modal = new bootstrap.Modal(createCycleModal);
          modal.hide();
        }, 1500); // Tempo de espera antes de fechar o modal

        document.getElementById("createCycleForm").reset();
      }

      submitButton.disabled = false; // Reabilita o botão se ocorrer erro
    });

  // Função para mostrar toast de mensagens
  function showToast(message) {
    const toastElement = document.getElementById("confirmationToast");
    const toastBody = document.getElementById("toast-body");

    // Atualiza a mensagem do Toast
    toastBody.textContent = message;

    // Remove classes antigas
    toastElement.classList.remove("text-success", "text-danger");

    // Adiciona a classe de acordo com o tipo de notificação
    toastElement.classList.add("text-primary");

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }

  // Função fictícia para carregar ciclos (implemente de acordo com sua lógica)
  async function loadCycles() {
    // Implemente a lógica de carregamento de ciclos aqui
    console.log("Ciclos carregados"); // Debugging
  }

  // Inicializa a lista de ciclos ao carregar a página
  loadCycles();
});
