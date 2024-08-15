import config from '../environments/config.js';
document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = config.api + "/cycle";
  let cycles = [];
  let cycleIdToDeactivate = null;
  let cycleIdToActivate = null;


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
      console.error("Erro ao obter dados da API", error);
    }
  }


  function displayCycles(data) {
    const tableBody = document.querySelector("#cycles-all tbody");
    tableBody.innerHTML = "";
    data.forEach((cycle) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td class="cell py-3">${cycle.id}</td>
        <td class="cell py-3">${cycle.title}</td>
        <td class="cell py-3">${cycle.active ? "Sim" : "Não"}</td>
        <td class="cell py-3">${formatDate(cycle.startDate)}</td>
        <td class="cell py-3">${formatDate(cycle.finishDate)}</td>
        <td class="cell py-3">
          <div class="dropdown">
            <div class="dropdown-toggle no-toggle-arrow" data-bs-toggle="dropdown" aria-expanded="false">
              <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-three-dots-vertical" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              </svg>
            </div>
            <ul class="dropdown-menu">
              <li><a href="#?id=${cycle.id}" class="dropdown-item text-primary"> <i class="fa-solid fa-edit"></i> Editar</a></li>
              <li><a href="#" class="dropdown-item ${cycle.active ? 'text-danger deactivate-btn' : 'text-success activate-btn'}" data-cycle-id="${cycle.id}">
                <i class="fa-solid ${cycle.active ? 'fa-ban' : 'fa-undo'}"></i> ${cycle.active ? 'Desativar' : 'Reativar'}
              </a></li>
            </ul>
          </div>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }


  async function deactivateCycle(cycleId) {
    try {
      const response = await fetch(`${apiUrl}/${cycleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      });

      if (response.ok) {
        showToast("Ciclo desativado com sucesso!", "success");
        loadCycles();
      } else {
        const errorText = await response.text();
        throw new Error(`Erro ao desativar o ciclo: ${errorText}`);
      }
    } catch (error) {
      console.error("Erro ao desativar o ciclo:", error);
      showToast("Erro ao desativar o ciclo. Tente novamente mais tarde.", "error");
    }
  }


  async function activateCycle(cycleId) {
    try {
      const response = await fetch(`${apiUrl}/${cycleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({
          active: true
        }),
      });

      if (response.ok) {
        showToast("Ciclo reativado com sucesso!", "success");
        loadCycles();
      } else {
        const errorText = await response.text();
        throw new Error(`Erro ao reativar o ciclo: ${errorText}`);
      }
    } catch (error) {
      console.error("Erro ao reativar o ciclo:", error);
      showToast("Erro ao reativar o ciclo. Tente novamente mais tarde.", "error");
    }
  }


  document.getElementById("cycles-all").addEventListener("click", (event) => {
    if (event.target.classList.contains("deactivate-btn")) {
      cycleIdToDeactivate = event.target.getAttribute("data-cycle-id");
      const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
      confirmationModal.show();
    } else if (event.target.classList.contains("activate-btn")) {
      cycleIdToActivate = event.target.getAttribute("data-cycle-id");
      const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
      confirmationModal.show();
    }
  });


  document.getElementById("confirmDeactivate").addEventListener("click", () => {
    if (cycleIdToDeactivate) {
      deactivateCycle(cycleIdToDeactivate);
      cycleIdToDeactivate = null;
      const confirmationModal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
      if (confirmationModal) {
        confirmationModal.hide();
      }
    }
  });

  document.getElementById("confirmReactivate").addEventListener("click", () => {
    if (cycleIdToActivate) {
      activateCycle(cycleIdToActivate);
      cycleIdToActivate = null;
      const confirmationModal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
      if (confirmationModal) {
        confirmationModal.hide();
      }
    }
  });


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


      const createCycleModal = document.getElementById("createCycleModal");
      const modalInstance = bootstrap.Modal.getInstance(createCycleModal);
      if (modalInstance) {
        modalInstance.hide();
      } else {
        console.error("Modal instance not found.");
      }


      document.getElementById("createCycleForm").reset();


      showToast(newCycle.mensagem);
    }
  });


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


  function formatDate(dateString) {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }


  loadCycles();
});