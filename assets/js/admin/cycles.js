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
      `;

      tableBody.appendChild(row);
    });
  }
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  loadCycles();
});
