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
       <td class="cell py-3">
            ${category.icon ? `<i class="${category.icon}"></i>` : '-'}
        </td>

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


  async function createCategory(categoryData) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao enviar dados: ${errorText}`)
      }
      return await response.json();
    } catch (error) {
      console.log("Erro durante o cadastro da categoria:", error);
      showToast("Erro ao cadastrar a categoria. Verifique os dados e tente novamente.", "error");
    }
  }

  document.getElementById("createCategoryForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = document.getElementById("categoryTitle").value;
    const icon = document.getElementById("categoryIcon").value;

    const categoryData = {
      title,
      icon,
    };

    const newCategory = await createCategory(categoryData);

    if (newCategory) {
      loadCategorys();

      const createCategoryModal = document.getElementById("createCategoryModal");
      const modalInstance = bootstrap.Modal.getInstance(createCategoryModal);
      if (modalInstance) {
        modalInstance.hide();
      } else {
        console.log("Modal instance not found.");
      }

      document.getElementById("createCategoryForm").reset();

      showToast(newCategory.mensagem);
    }
  });

  function showToast(message, type = "success") {
    const toastElement = document.getElementById("confirmationToast");
    const toastBody = document.getElementById("toast-body");
    toastBody.textContent = message;

    toastElement.classList.remove("text-success", "text-danger");
    if (type === "success") {
      toastElement.classList.add("text-primary");
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  loadCategorys();
});