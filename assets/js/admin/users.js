document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://testes-apibaoounao.iftmparacatu.app.br/user";

  let users = [];

  if (!sessionStorage.getItem("jwt")) {
    window.location.href = "../errors/404.html";
    return;
  }
  if (!sessionStorage.getItem("roles").includes("ROLE_ADMINISTRATOR")) {
    window.location.href = "../errors/404.html";
    return;
  }
  async function loadUsers() {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      users = await response.json();
      displayUsers(users);
    } catch (error) {
      console.log("Erro ao obter dados da API", error);
    }
  }

  function displayUsers(data) {
    const tableBody = document.querySelector("#users-all tbody");

    const roleMapping = {
      ROLE_USER: "Usuário",
      ROLE_ADMINISTRATOR: "Administrador",
    };

    tableBody.innerHTML = "";

    data.forEach((user) => {
      const row = document.createElement("tr");

      const friendlyRoles = user.roles
        .map((role) => roleMapping[role.name] || role.name)
        .join(", ");

      row.innerHTML = `
        <td class="cell">${user.id}</td>
        <td class="cell">${user.name}</td>
        <td class="cell">${user.email}</td>
        <td class="cell">${user.type}</td>
        <td class="cell">${user.active ? "Sim" : "Não"}</td>
        <td class="cell">${formatDate(user.createdAt)}</td>
        <td class="cell">${friendlyRoles}</td>
          <td class="cell">
          <div class="dropdown">
            <div class="dropdown-toggle no-toggle-arrow" data-bs-toggle="dropdown" aria-expanded="false">
              <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-three-dots-vertical" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              </svg>
            </div>
            <ul class="dropdown-menu">
              <li><a href="#?id=${
                user.id
              }" class="dropdown-item text-primary"> <i class="fa-solid fa-edit"></i> Editar</a></li>
              <li><a href="#?id=${
                user.id
              }" class="dropdown-item text-danger"><i class="fa-solid fa-ban"></i> Desativar</a></li>
               <li>
                                                <hr class="dropdown-divider">
                                            </li>
               <li><a href="#?id=${
                 user.id
               }" class="dropdown-item text-info"><i class="fa-solid fa-arrow-up"></i> Tornar Administrador</a></li>
               <li><a href="#?id=${
                 user.id
               }" class="dropdown-item text-warning"><i class="fa-solid fa-arrow-down"></i> Revogar Administrador</a></li>
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

  loadUsers();
});
