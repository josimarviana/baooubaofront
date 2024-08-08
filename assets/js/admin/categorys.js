document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://apibaoounao.iftmparacatu.app.br/category";
  let categorys = [];

  if (!sessionStorage.getItem("jwt")) {
    window.location.href = "../errors/404.html";
    return;
  }
  if (!sessionStorage.getItem("roles").includes("ROLE_ADMINISTRATO")) {
    window.location.href = "../errors/404.html";
    return;
  }
  async function loadCategorys() {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      categorys = await response.json();
      displayCategorys(categorys);
    } catch (error) {
      console.log("Erro ao obter dados da API ", error);
    }
  }
  function displayCategorys(data) {
    const tableBody = document.querySelector("#categorys-all tbody");
    tableBody.innherHTML = "";
    data.forEach((category) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="cell">${category.title}</td>
        <td class="cell">${category.active ? "Sim" : "Não"}</td>
        <td class="cell">${category.icon || "-"}</td>
        <td class="cell">${formatDate(category.createdAt)}</td>
       <td class="cell">${
         category.finishedAt ? formatDate(category.finishedAt) : "-"
       }</td>
        `;

      tableBody.appendChild(row);
    });
  }
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  loadCategorys();
});
