import config from "../environments/config.js";
import showToast from "../app/toast.js";

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
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || "Erro ao carregar dados");
      }
      cycles = await response.json();
      displayCycles(cycles);
    } catch (error) {
      showToast(error.message, "error");
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
              <i class="bi bi-three-dots-vertical"></i>
            </div>
            <ul class="dropdown-menu">            
              <li><a href="#" class="dropdown-item text-primary edit-btn" data-cycle-id="${
                cycle.id
              }"> 
                <i class="fa-solid fa-edit"></i> Editar
              </a></li>
              <li><a href="#" class="dropdown-item ${
                cycle.active
                  ? "text-danger deactivate-btn"
                  : "text-success activate-btn"
              }" data-cycle-id="${cycle.id}">
                <i class="fa-solid ${
                  cycle.active ? "fa-ban" : "fa-undo"
                }"></i> ${cycle.active ? "Desativar" : "Reativar"}
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

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || "Erro ao desativar ciclo");
      }

      showToast("Ciclo desativado com sucesso!", "success");
      loadCycles();
    } catch (error) {
      showToast(error.message, "error");
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
          active: true,
        }),
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || "Erro ao ativar ciclo");
      }

      showToast("Ciclo ativado com sucesso!", "success");
      loadCycles();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function editCycle(cycleId, cycleData) {
    try {
      const response = await fetch(`${apiUrl}/${cycleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(cycleData),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || "Erro ao atualizar ciclo");
      }

      showToast("Ciclo atualizado com sucesso!", "success");
      loadCycles();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  document
    .getElementById("cycles-all")
    .addEventListener("click", async (event) => {
      if (event.target.classList.contains("edit-btn")) {
        const cycleId = event.target.getAttribute("data-cycle-id");

        try {
          const response = await fetch(`${apiUrl}/${cycleId}`, {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
            },
          });

          if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(
              errorResponse.mensagem || "Erro ao carregar dados do ciclo"
            );
          }

          const cycle = await response.json();

          document.getElementById("editCycleTitle").value = cycle.title;
          document.getElementById("editStartDate").value = cycle.startDate;
          document.getElementById("editEndDate").value = cycle.finishDate;
          document
            .getElementById("editCycleModal")
            .setAttribute("data-cycle-id", cycleId);

          const editModal = new bootstrap.Modal(
            document.getElementById("editCycleModal")
          );
          editModal.show();
        } catch (error) {
          showToast(error.message, "error");
        }
      } else if (event.target.classList.contains("deactivate-btn")) {
        cycleIdToDeactivate = event.target.getAttribute("data-cycle-id");
        const confirmationModal = new bootstrap.Modal(
          document.getElementById("confirmationModal")
        );
        confirmationModal.show();
      } else if (event.target.classList.contains("activate-btn")) {
        cycleIdToActivate = event.target.getAttribute("data-cycle-id");
        const confirmationModal = new bootstrap.Modal(
          document.getElementById("confirmationModal")
        );
        confirmationModal.show();
      }
    });

  document.getElementById("confirmDeactivate").addEventListener("click", () => {
    if (cycleIdToDeactivate) {
      deactivateCycle(cycleIdToDeactivate);
      cycleIdToDeactivate = null;
      const confirmationModal = bootstrap.Modal.getInstance(
        document.getElementById("confirmationModal")
      );
      if (confirmationModal) {
        confirmationModal.hide();
      }
    }
  });

  document.getElementById("confirmReactivate").addEventListener("click", () => {
    if (cycleIdToActivate) {
      activateCycle(cycleIdToActivate);
      cycleIdToActivate = null;
      const confirmationModal = bootstrap.Modal.getInstance(
        document.getElementById("confirmationModal")
      );
      if (confirmationModal) {
        confirmationModal.hide();
      }
    }
  });

  document
    .getElementById("editCycleForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const cycleId = document
        .getElementById("editCycleModal")
        .getAttribute("data-cycle-id");
      const title = document.getElementById("editCycleTitle").value;
      const startDate = document.getElementById("editStartDate").value;
      const endDate = document.getElementById("editEndDate").value;

      const cycleData = {
        title,
        startDate,
        finishDate: endDate,
      };

      await editCycle(cycleId, cycleData);
      const editModal = bootstrap.Modal.getInstance(
        document.getElementById("editCycleModal")
      );
      if (editModal) {
        editModal.hide();
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
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || "Erro ao criar ciclo");
      }
      return await response.json();
    } catch (error) {
      showToast(error.message, "error");
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
        title,
        startDate,
        finishDate: endDate,
      };

      const newCycle = await createCycle(cycleData);
      if (newCycle) {
        loadCycles();
        const createCycleModal = document.getElementById("createCycleModal");
        const bootstrapModal = bootstrap.Modal.getInstance(createCycleModal);
        if (bootstrapModal) {
          bootstrapModal.hide();
        }
      }
    });

  function formatDate(dateString) {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  }

  loadCycles();
});
