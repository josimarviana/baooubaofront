import config from "../environments/config.js";
import showToast from "../app/toast.js";

document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = config.api + "/user/filter";

  if (!sessionStorage.getItem("jwt")) {
    window.location.href = "../errors/404.html";
    return;
  }
  if (!sessionStorage.getItem("roles").includes("ROLE_ADMINISTRATOR")) {
    window.location.href = "../errors/404.html";
    return;
  }

  async function toggleUserStatus(userId, isActive) {
    try {
      const method = isActive ? "DELETE" : "PATCH";
      const endpoint = `${config.api}/user/${userId}`;
      const options = {
        method,
        headers: {
          "Content-Type": isActive ? undefined : "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: isActive ? undefined : JSON.stringify({ active: true }),
      };

      const response = await fetch(endpoint, options);

      if (response.status === 204) {
        showToast(
          `Usuário ${isActive ? "desativado" : "reativado"} com sucesso.`,
          "success"
        );
        loadUsers();
      } else if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || "Erro ao alterar o status");
      } else {
        const successResponse = await response.json();
        showToast(successResponse.mensagem, "success");
        loadUsers();
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  }
  async function toggleUserRole(userId, revoke) {
    try {
      const response = await fetch(
        `${config.api}/user/role/revoke-adm/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          },
          body: JSON.stringify({ revoke }),
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || "Erro ao alterar o cargo");
      }

      const successResponse = await response.json();
      showToast(successResponse.mensagem, "success");
      loadUsers();
    } catch (error) {
      showToast(error.message, "error");
    }
  }
  async function loadUsers(query = "", page = 0, size = 9, sort = "") {
    try {
      const response = await fetch(
        `${apiUrl}?contain=${encodeURIComponent(
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

      const result = await response.json();
      displayUsers(result.users);
      updatePagination(result.currentPage, result.totalPages);
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
        loadUsers("", 0);
      });
      paginationContainer.appendChild(firstPageButton);
    }

    if (currentPage > 0) {
      const prevButton = document.createElement("li");
      prevButton.className = "page-item";
      prevButton.innerHTML = `<a class="btn app-btn-primary me-2" href="#" aria-label="Anterior">&laquo;</a>`;
      prevButton.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        loadUsers("", currentPage - 1);
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
        loadUsers("", i);
      });
      paginationContainer.appendChild(pageButton);
    }

    if (currentPage < totalPages - 1) {
      const nextButton = document.createElement("li");
      nextButton.className = "page-item";
      nextButton.innerHTML = `<a class="btn app-btn-primary me-2" href="#" aria-label="Próxima">&raquo;</a>`;
      nextButton.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        loadUsers("", currentPage + 1);
      });
      paginationContainer.appendChild(nextButton);
    }

    if (currentPage < totalPages - 1) {
      const lastPageButton = document.createElement("li");
      lastPageButton.className = "page-item";
      lastPageButton.innerHTML = `<a class="btn app-btn-primary" href="#" aria-label="Última">Última</a>`;
      lastPageButton.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        loadUsers("", totalPages - 1);
      });
      paginationContainer.appendChild(lastPageButton);
    }
  }

  function displayUsers(users) {
    const tableBody = document.querySelector("#users-all tbody");

    const roleMapping = {
      ROLE_USER: "Usuário",
      ROLE_ADMINISTRATOR: "Administrador",
      ESTUDANTE: "Estudante",
      DOCENTE: "Docente",
      TAE: "TAE",
    };

    tableBody.innerHTML = "";

    users.forEach((user) => {
      const row = document.createElement("tr");

      const friendlyRoles = user.roles
        .map((role) => roleMapping[role] || role)
        .join(", ");

      const isAdmin = user.roles.includes("ROLE_ADMINISTRATOR");
      const buttonText = isAdmin ? "Revogar ADM" : "Tornar ADM";
      const revoke = isAdmin;
      const textClass = revoke ? "text-danger" : "text-primary";

      const isActive = user.active;
      const statusButtonText = isActive ? "Desativar" : "Ativar";
      const statusTextClass = isActive ? "text-danger" : "text-primary";

      row.innerHTML = `
        <td class="cell py-3">${user.id}</td>
        <td class="cell py-3">${user.name}</td>
        <td class="cell py-3">${user.email}</td>
        <td class="cell py-3">${user.type}</td>
        <td class="cell py-3">${user.active ? "Sim" : "Não"}</td>
        <td class="cell py-3">${new Date(
          user.createdAt
        ).toLocaleDateString()}</td>
        <td class="cell py-3">${friendlyRoles}</td>
        <td class="cell py-3">
          <div class="dropdown">
            <div class="dropdown-toggle no-toggle-arrow" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-three-dots-vertical"></i>
            </div>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item toggle-role ${textClass}" href="#" data-id="${
        user.id
      }" data-revoke="${revoke}">${buttonText}</a></li>
              <li><a class="dropdown-item toggle-status ${statusTextClass}" data-id="${
        user.id
      }" href="#" data-active="${isActive}">${statusButtonText}</a></li>
            </ul>
          </div>
        </td>
      `;

      tableBody.appendChild(row);
    });

    document.querySelectorAll(".toggle-role").forEach((element) => {
      element.addEventListener("click", function (e) {
        e.preventDefault();
        const userId = this.getAttribute("data-id");
        const revoke = this.getAttribute("data-revoke") === "true";
        toggleUserRole(userId, revoke);
      });
    });
    document.querySelectorAll(".toggle-status").forEach((element) => {
      element.addEventListener("click", function (e) {
        e.preventDefault();
        const userId = this.getAttribute("data-id");
        const isActive = this.getAttribute("data-active") === "true";
        toggleUserStatus(userId, isActive);
      });
    });
  }
  const sortSelect = document.getElementById("sortSelect");
  sortSelect.addEventListener("change", function () {
    const selectedOption = sortSelect.value;
    let sortCriteria = "";

    switch (selectedOption) {
      case "role_administrator":
        sortCriteria = "role_administrator";
        break;
      case "role_user":
        sortCriteria = "role_user";
        break;
      case "estudante":
        sortCriteria = "estudante";
        break;
      case "docente":
        sortCriteria = "docente";
        break;
      case "tae":
        sortCriteria = "tae";
        break;
      default:
        sortCriteria = "";
        break;
    }
    const query = document.getElementById("search-users").value;
    loadUsers(query, 0, 9, sortCriteria);
  });

  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const query = document.getElementById("search-users").value;
    const sortCriteria = sortSelect.value;
    loadUsers(query, 0, 9, sortCriteria);
  });

  loadUsers();
});
