document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://apibaoounao.iftmparacatu.app.br/cycle";
  let cycles = [];

  if (!sessionStorage.getItem("jwt")) {
    window.location.href = "../errors/404.html";
    return;
  }
  if (!sessionStorage.getItem("roles").includes("ROLE_ADMINISTRATOR")) {
    window.location.href = "../errors/404.html";
    return;
  }

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
      console.log("Erro ao obter dados da API", error);
    }
  }

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
              <li><a href="#?id=${
                cycle.id
              }" class="dropdown-item text-primary"> <i class="fa-solid fa-edit"></i> Editar</a></li>
              <li><a href="#?id=${
                cycle.id
              }" class="dropdown-item text-danger"><i class="fa-solid fa-ban"></i> Desativar</a></li>
            </ul>
          </div>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

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

      console.log("Status da resposta:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao enviar dados: ${errorText}`);
      }

      // Verificar se há um corpo de resposta para processar
      let responseData = {};
      try {
        responseData = await response.json();
      } catch (e) {
        // Se a resposta não for JSON, apenas continue
        console.log("Resposta não é JSON ou está vazia:", e);
      }

      // Se o status for 201, o ciclo foi criado com sucesso
      showToast("Ciclo criado com sucesso!");
      return responseData; // Retornar os dados da resposta, se houver
    } catch (error) {
      console.error("Erro durante o cadastro do ciclo:", error);
      showToast(
        "Erro ao cadastrar o ciclo. Verifique os dados e tente novamente."
      );
    }
  }

  document
    .getElementById("createCycleForm")
    .addEventListener("submit", async (event) => {
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
          const modal = new bootstrap.Modal(
            document.getElementById("createCycleModal")
          );
          modal.hide();
        }, 500); // Espera meio segundo antes de esconder o modal
        loadCycles();
      }
    });

  function showToast(message) {
    const toastBody = document.getElementById("toast-body");
    toastBody.textContent = message;
    const toastEl = document.getElementById("confirmationToast");
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }

  loadCycles();
});
