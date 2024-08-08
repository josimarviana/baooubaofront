document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://apibaoounao.iftmparacatu.app.br/user";

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
          Authorization: `Bearer ${jwt}`,
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
      console.log(user);
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
