document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://testes-apibaoounao.iftmparacatu.app.br/category";
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
    tableBody.innerHTML = "";
    data.forEach((category) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="cell py-3">${category.id}</td>
        <td class="cell py-3">${category.title}</td>
        <td class="cell py-3">${category.active ? "Sim" : "Não"}</td>
        <td class="cell py-3">${category.icon || "-"}</td>
        <td class="cell py-3">${formatDate(category.createdAt)}</td>
       <td class="cell py-3">${
         category.finishedAt ? formatDate(category.finishedAt) : "-"
       }</td>
       
        
       <td class="cell py-3">
          <div class="dropdown">
            <div class="dropdown-toggle no-toggle-arrow" data-bs-toggle="dropdown" aria-expanded="false">
              <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-three-dots-vertical" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              </svg>
            </div>
            <ul class="dropdown-menu">
              <li><a href="#?id=${
                category.id
              }" class="dropdown-item text-primary"> <i class="fa-solid fa-edit"></i> Editar</a></li>
              <li><a href="#?id=${
                category.id
              }" class="dropdown-item text-danger"><i class="fa-solid fa-ban"></i> Desativar</a></li>
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
  loadCategorys();
});