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

  async function loadCycles(query = "", page = 0, size = 9, sort = "") {
    try {
      const response = await fetch(
        `${apiUrl}/filter?contain=${encodeURIComponent(
          query
        )}&page=${page}&size=${size}&sort=${sort}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          },
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || "Erro ao carregar dados");
      }

      const data = await response.json();
      cycles = data.cycleEntityList;
      displayCycles(cycles);
      updatePagination(data.currentPage, data.totalPages);
    } catch (error) {
      showToast(error.message, "error");
    }
  }
  function updatePagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById("paginationContainer");
    paginationContainer.innerHTML = "";

    if (currentPage > 0) {
      const firstPageButton = document.createElement("li");
      firstPageButton.className = "page-item";
      firstPageButton.innerHTML = `<a class="btn app-btn-primary me-2" href="#" aria-label="Primeira">Primeira</a>`;
      firstPageButton.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        loadCycles("", 0);
      });
      paginationContainer.appendChild(firstPageButton);
    }

    if (currentPage > 0) {
      const prevButton = document.createElement("li");
      prevButton.className = "page-item";
      prevButton.innerHTML = `<a class="btn app-btn-primary me-2" href="#" aria-label="Anterior">&laquo;</a>`;
      prevButton.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        loadCycles("", currentPage - 1);
      });
      paginationContainer.appendChild(prevButton);
    }

    const startPage = Math.max(0, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement("li");
      pageButton.className = `page-item ${i === currentPage ? "active" : ""}`;
      pageButton.innerHTML = `<a class="btn app-btn-primary me-2" href="#">${
        i + 1
      }</a>`;
      pageButton.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        loadCycles("", i);
      });
      paginationContainer.appendChild(pageButton);
    }

    if (currentPage < totalPages - 1) {
      const nextButton = document.createElement("li");
      nextButton.className = "page-item";
      nextButton.innerHTML = `<a class="btn app-btn-primary me-2" href="#" aria-label="Próxima">&raquo;</a>`;
      nextButton.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        loadCycles("", currentPage + 1);
      });
      paginationContainer.appendChild(nextButton);
    }

    if (currentPage < totalPages - 1) {
      const lastPageButton = document.createElement("li");
      lastPageButton.className = "page-item";
      lastPageButton.innerHTML = `<a class="btn app-btn-primary" href="#" aria-label="Última">Última</a>`;
      lastPageButton.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        loadCycles("", totalPages - 1);
      });
      paginationContainer.appendChild(lastPageButton);
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

  const sortSelect = document.getElementById("sortSelect");
  sortSelect.addEventListener("change", function () {
    const sortCriteria = sortSelect.value;
    const query = document.getElementById("search-cycles").value;
    loadCycles(query, 0, 9, sortCriteria);
  });

  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const query = document.getElementById("search-cycles").value;
    const sortCriteria = sortSelect.value;
    loadCycles(query, 0, 9, sortCriteria);
  });
  loadCycles();
});
