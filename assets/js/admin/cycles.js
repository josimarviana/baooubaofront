document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://apibaoounao.iftmparacatu.app.br/cycle";
  const jwt = sessionStorage.getItem("jwt");
  let cycles = [];

  if (!jwt) {
    window.location.href = "../errors/404.html";
    return;
  }
  async function loadCycles() {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${jwt}`,
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
      console.log(cycle);
      const row = document.createElement("tr");

      row.innerHTML = `
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
