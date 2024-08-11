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

  // Função para formatar datas
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  // Função para criar um ciclo
  async function createCycle(cycleData) {
    try {
      console.log("Enviando dados para a API:", cycleData);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(cycleData),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Erro desconhecido";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.mensagem || "Erro desconhecido";
        } catch (jsonError) {
          console.error("Erro ao processar JSON de erro:", jsonError);
        }

        console.error("Erro ao processar cadastro do ciclo:", errorText);
        showToast(errorMessage, "error");
        return;
      }

      showToast("Ciclo criado com sucesso!");
      return await response.json(); // Retorna os dados da resposta
    } catch (error) {
      console.error("Erro durante o cadastro do ciclo:", error);
      showToast("Erro ao cadastrar o ciclo. Verifique os dados e tente novamente.", "error");
    }
  }

  // Manipula o envio do formulário de criação de ciclo
  document.getElementById("createCycleForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("cycleTitle").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    const cycleData = {
      title: title.trim(),
      startDate: startDate.trim(),
      finishDate: endDate.trim(),
    };

    const newCycle = await createCycle(cycleData);
    if (newCycle) {
      document.getElementById("createCycleForm").reset();
      setTimeout(() => {
        const modal = new bootstrap.Modal(document.getElementById("createCycleModal"));
        modal.hide();
      }, 500); // Espera meio segundo antes de esconder o modal
      loadCycles(); // Recarrega a lista de ciclos
    }
  });

  // Função para mostrar mensagens toast
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

  // Carrega os ciclos ao inicializar
  loadCycles();
});