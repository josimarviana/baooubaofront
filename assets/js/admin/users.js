import config from '../environments/config.js';
import showToast from '../app/toast.js';

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

  async function loadUsers(query = "", sort = "") {
    try {
      const response = await fetch(`${apiUrl}?contain=${encodeURIComponent(query)}&sort=${sort}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || "Erro ao carregar dados");
      }

      const data = await response.json();
      displayUsers(data.users); // Use data.users para acessar a lista de usuários
    } catch (error) {
      showToast("Erro ao obter dados da API", "error");
    }
  }

  function displayUsers(users) {
    const tableBody = document.querySelector("#users-all tbody");

    const roleMapping = {
      ROLE_USER: "Usuário",
      ROLE_ADMINISTRATOR: "Administrador",
      ESTUDANTE: "Estudante",
      DOCENTE: "Docente",
      TAE: "TAE"
    };

    tableBody.innerHTML = "";

    users.forEach((user) => {
      const row = document.createElement("tr");

      const friendlyRoles = user.roles
        .map((role) => roleMapping[role] || role)
        .join(", ");

      row.innerHTML = `
        <td class="cell py-3">${user.id}</td>
        <td class="cell py-3">${user.name}</td>
        <td class="cell py-3">${user.email}</td>
        <td class="cell py-3">${user.type}</td>
        <td class="cell py-3">${user.active ? "Sim" : "Não"}</td>
        <td class="cell py-3">${new Date(user.createdAt).toLocaleDateString()}</td>
        <td class="cell py-3">${friendlyRoles}</td>
        <td class="cell py-3">
          <div class="dropdown">
            <div class="dropdown-toggle no-toggle-arrow" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-three-dots-vertical"></i>
            </div>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Ação 1</a></li>
              <li><a class="dropdown-item" href="#">Ação 2</a></li>
            </ul>
          </div>
        </td>
      `;

      tableBody.appendChild(row);
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
    loadUsers("", sortCriteria);
  });

  loadUsers();
});