document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://apibaoounao.iftmparacatu.app.br/cycle";
  let cycles = [];

  // Verifica autenticação e permissões
  if (!sessionStorage.getItem("jwt")) {
    window.location.href = "../errors/404.html";
    return;
  }
  if (!sessionStorage.getItem("roles").includes("ROLE_ADMINISTRATOR")) {
    window.location.href = "../errors/404.html";
    return;
  }

  // Função para carregar os ciclos da API
  async function loadCycles() {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      cycles = await response.json();
      displayCycles(cycles);
    } catch (error) {
      console.error("Erro ao obter dados da API", error);
    }
  }

  // Função para exibir os ciclos na tabela
  function displayCycles(data) {
    const tableBody = document.querySelector("#cycles-all tbody");
    tableBody.innerHTML = "";
    data.forEach((cycle) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td class="cell">${cycle.id}</td>
        <td class="cell">${cycle.title}</td>
        <td class="cell">${formatDate(cycle.startDate)}</td>
        <td class="cell">${formatDate(cycle.finishDate)}</td>
        <td class="cell">
          <div class="dropdown">
            <div class="dropdown-toggle no-toggle-arrow" data-bs-toggle="dropdown" aria-expanded="false">
              <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-three-dots-vertical" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              </svg>
            </div>
            <ul class="dropdown-menu">
              <li><a href="#?id=${cycle.id}" class="dropdown-item text-primary"> <i class="fa-solid fa-edit"></i> Editar</a></li>
              <li><a href="#?id=${cycle.id}" class="dropdown-item text-danger"><i class="fa-solid fa-ban"></i> Desativar</a></li>
            </ul>
          </div>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  // Função para cadastrar um novo ciclo
  async function createCycle(cycleData) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(cycleData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao enviar dados: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Erro durante o cadastro do ciclo:", error);
      showToast("Erro ao cadastrar o ciclo. Verifique os dados e tente novamente.", "error");
    }
  }

  // Manipulador de envio do formulário
  document.getElementById("createCycleForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("cycleTitle").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    const cycleData = {
      title,
      startDate,
      finishDate: endDate,
    };

    const newCycle = await createCycle(cycleData);
    if (newCycle) {
      loadCycles();

      // Fechar o modal usando a API do Bootstrap
      const createCycleModal = document.getElementById("createCycleModal");
      const modalInstance = bootstrap.Modal.getInstance(createCycleModal);
      if (modalInstance) {
        modalInstance.hide();
      } else {
        console.error("Modal instance not found.");
      }

      // Resetar o formulário
      document.getElementById("createCycleForm").reset();

      // Mostrar o toast
      showToast(newCycle.mensagem);
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

  // Função para formatar datas
  function formatDate(dateString) {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // Carregar ciclos ao iniciar
  loadCycles();
});