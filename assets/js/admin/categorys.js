import config from '../environments/config.js';

document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = config.api + "/category";
  let categories = [];

  let categoryIdToDeactivate = null;
  let categoryIdToReactivate = null;

  if (!sessionStorage.getItem("jwt")) {
    window.location.href = "../errors/404.html";
    return;
  }
  if (!sessionStorage.getItem("roles").includes("ROLE_ADMINISTRATOR")) {
    window.location.href = "../errors/404.html";
    return;
  }

  async function loadCategories() {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      categories = await response.json();
      displayCategories(categories);
    } catch (error) {
      console.log("Erro ao obter dados da API ", error);
    }
  }

  function displayCategories(data) {
    const tableBody = document.querySelector("#categories-all tbody");
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
            <td class="cell py-3">
                <div class="dropdown">
                    <div class="dropdown-toggle no-toggle-arrow" data-bs-toggle="dropdown" aria-expanded="false">
                        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-three-dots-vertical" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                        </svg>
                    </div>
                    <ul class="dropdown-menu">
                        <li><a href="#?id=${category.id}" class="dropdown-item text-primary"><i class="fa-solid fa-edit"></i> Editar</a></li>
                        <li>
                            <a href="#" class="dropdown-item ${category.active ? 'text-danger deactivate-btn' : 'text-info reactivate-btn'}" data-category-id="${category.id}">
                                <i class="fa-solid ${category.active ? 'fa-ban' : 'fa-check'}"></i> ${category.active ? 'Desativar' : 'Reativar'}
                            </a>
                        </li>
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
      loadCategories();

      const createCategoryModal = document.getElementById("createCategoryModal");
      const modalInstance = bootstrap.Modal.getInstance(createCategoryModal);
      if (modalInstance) {
        modalInstance.hide();
      } else {
        console.log("Modal instance not found.");
      }

      document.getElementById("createCategoryForm").reset();

      showToast(newCategory.message);
    }
  });

  async function reactivateCategory(categoryId) {
    try {
      const response = await fetch(`${apiUrl}/${categoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify({
          active: true
        }),
      });

      if (response.ok) {
        showToast("Categoria reativada com sucesso!", "success");
        loadCategories();
      } else {
        const errorText = await response.text();
        throw new Error(`Erro ao reativar categoria: ${errorText}`);
      }
    } catch (error) {
      console.log("Erro ao reativar a categoria: ", error);
      showToast("Erro ao reativar a categoria. Tente novamente mais tarde.", "error");
    }
  }

  async function deactivateCategory(categoryId) {
    try {
      const response = await fetch(`${apiUrl}/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      });

      if (response.ok) {
        showToast("Categoria desativada com sucesso!", "success");
        loadCategories();
      } else {
        const errorText = await response.text();
        throw new Error(`Erro ao desativar categoria: ${errorText}`);
      }
    } catch (error) {
      console.log("Erro ao desativar a categoria: ", error);
      showToast("Erro ao desativar a categoria. Tente novamente mais tarde.", "error");
    }
  }

  document.getElementById("categories-all").addEventListener("click", (event) => {
    if (event.target.classList.contains("deactivate-btn")) {
      categoryIdToDeactivate = event.target.getAttribute("data-category-id");
      const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
      confirmationModal.show();
    } else if (event.target.classList.contains("reactivate-btn")) {
      categoryIdToReactivate = event.target.getAttribute("data-category-id");
      const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
      confirmationModal.show();
    }
  });

  document.getElementById("confirmDeactivate").addEventListener("click", () => {
    if (categoryIdToDeactivate) {
      deactivateCategory(categoryIdToDeactivate);
      categoryIdToDeactivate = null;
      const confirmationModal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
      if (confirmationModal) {
        confirmationModal.hide();
      }
    }
  });

  document.getElementById("confirmReactivate").addEventListener("click", () => {
    if (categoryIdToReactivate) {
      reactivateCategory(categoryIdToReactivate);
      categoryIdToReactivate = null;
      const confirmationModal = bootstrap.Modal.getInstance(document.getElementById('confirmationModal'));
      if (confirmationModal) {
        confirmationModal.hide();
      }
    }
  });

  function showToast(message, type = "success") {
    const toastElement = document.getElementById("confirmationToast");
    const toastBody = document.getElementById("toast-body");
    toastBody.textContent = message;

    toastElement.classList.remove("text-success", "text-danger");
    if (type === "success") {
      toastElement.classList.add("text-primary");
    } else if (type === "error") {
      toastElement.classList.add("text-danger");
    }

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  loadCategories();
});