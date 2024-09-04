import config from "../environments/config.js";
import showToast from "../app/toast.js";

document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = config.api + "/category";
  let categories = [];
  let categoryIdToDeactivate = null;
  let categoryIdToReactivate = null;
  let categoryIdToEdit = null;

  if (!sessionStorage.getItem("jwt")) {
    window.location.href = "../errors/404.html";
    return;
  }
  if (!sessionStorage.getItem("roles").includes("ROLE_ADMINISTRATOR")) {
    window.location.href = "../errors/404.html";
    return;
  }

  async function loadCategories(query = "", page = 0, size = 9, sort = "") {
    try {
      const response = await fetch(
        `${apiUrl}/filter?contain=${encodeURIComponent(
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
        throw new Error(
          errorResponse.mensagem || "Erro ao carregar categorias"
        );
      }
      const data = await response.json();
      categories = data.categoryEntityList;
      displayCategories(categories);
      updatePagination(data.currentPage, data.totalPages);
    } catch (error) {
      showToast(error.message, "error");
      console.log("Erro ao obter dados da API ", error);
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
        loadCategories("", 0);
      });
      paginationContainer.appendChild(firstPageButton);
    }

    if (currentPage > 0) {
      const prevButton = document.createElement("li");
      prevButton.className = "page-item";
      prevButton.innerHTML = `<a class="btn app-btn-primary me-2" href="#" aria-label="Anterior">&laquo;</a>`;
      prevButton.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        loadCategories("", currentPage - 1);
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
        loadCategories("", i);
      });
      paginationContainer.appendChild(pageButton);
    }

    if (currentPage < totalPages - 1) {
      const nextButton = document.createElement("li");
      nextButton.className = "page-item";
      nextButton.innerHTML = `<a class="btn app-btn-primary me-2" href="#" aria-label="Próxima">&raquo;</a>`;
      nextButton.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        loadCategories("", currentPage + 1);
      });
      paginationContainer.appendChild(nextButton);
    }

    if (currentPage < totalPages - 1) {
      const lastPageButton = document.createElement("li");
      lastPageButton.className = "page-item";
      lastPageButton.innerHTML = `<a class="btn app-btn-primary" href="#" aria-label="Última">Última</a>`;
      lastPageButton.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        loadCategories("", totalPages - 1);
      });
      paginationContainer.appendChild(lastPageButton);
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
          ${category.icon ? `<i class="${category.icon}"></i>` : "-"}
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
              <li><a href="#" class="dropdown-item text-primary" data-category-id="${
                category.id
              }"><i class="fa-solid fa-edit"></i> Editar</a></li>
              <li>
                <a href="#" class="dropdown-item ${
                  category.active
                    ? "text-danger deactivate-btn"
                    : "text-info reactivate-btn"
                }" data-category-id="${category.id}">
                  <i class="fa-solid ${
                    category.active ? "fa-ban" : "fa-check"
                  }"></i> ${category.active ? "Desativar" : "Reativar"}
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
        const errorResponse = await response.json();
        throw new Error(
          errorResponse.mensagem ||
            "Erro ao cadastrar categoria. Verifique os dados e tente novamente."
        );
      }
      const result = await response.json();
      return result;
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  document
    .getElementById("createCategoryForm")
    .addEventListener("submit", async (event) => {
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

        const createCategoryModal = document.getElementById(
          "createCategoryModal"
        );
        const modalInstance = bootstrap.Modal.getInstance(createCategoryModal);
        if (modalInstance) {
          modalInstance.hide();
        } else {
          console.log("Modal instance not found.");
        }

        document.getElementById("createCategoryForm").reset();
        showToast(newCategory.mensagem, "success");
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
          active: true,
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || "Erro ao reativar categoria");
      }
      const result = await response.json();
      showToast(
        result.mensagem || "Categoria reativada com sucesso!",
        "success"
      );
      loadCategories();
    } catch (error) {
      showToast(error.message, "error");
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
        // Se a resposta não tiver corpo, não deve tentar parsear como JSON
        const message = await response.text(); // Obtém a resposta como texto
        showToast(message || "Categoria desativada com sucesso!", "success");
        loadCategories();
      } else {
        // Tentativa de ler uma resposta JSON se não for "ok"
        const errorResponse = await response.json().catch(() => {
          throw new Error("Erro ao desativar categoria");
        });
        throw new Error(
          errorResponse.mensagem || "Erro ao desativar categoria"
        );
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function editCategory(categoryId, updatedData) {
    try {
      const response = await fetch(`${apiUrl}/${categoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || "Erro ao editar categoria");
      }

      const result = await response.json();
      showToast(result.mensagem || "Categoria editada com sucesso!", "success");
      loadCategories();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  document
    .getElementById("editCategoryForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const title = document.getElementById("editCategoryTitle").value;
      const icon = document.getElementById("editCategoryIcon").value;

      if (categoryIdToEdit) {
        const updatedData = {
          title,
          icon,
        };

        await editCategory(categoryIdToEdit, updatedData);

        const editCategoryModal = document.getElementById("editCategoryModal");
        const modalInstance = bootstrap.Modal.getInstance(editCategoryModal);
        if (modalInstance) {
          modalInstance.hide();
        } else {
          console.log("Modal instance not found.");
        }
        document.getElementById("editCategoryForm").reset();
      }
    });

  document
    .getElementById("categories-all")
    .addEventListener("click", (event) => {
      if (event.target.classList.contains("deactivate-btn")) {
        categoryIdToDeactivate = event.target.getAttribute("data-category-id");
        const confirmationModal = new bootstrap.Modal(
          document.getElementById("confirmationModal")
        );
        confirmationModal.show();
      } else if (event.target.classList.contains("reactivate-btn")) {
        categoryIdToReactivate = event.target.getAttribute("data-category-id");
        const confirmationModal = new bootstrap.Modal(
          document.getElementById("confirmationModal")
        );
        confirmationModal.show();
      } else if (event.target.closest(".dropdown-item.text-primary")) {
        categoryIdToEdit = event.target
          .closest(".dropdown-item.text-primary")
          .getAttribute("data-category-id");
        const category = categories.find((cat) => cat.id == categoryIdToEdit);

        if (category) {
          document.getElementById("editCategoryTitle").value = category.title;
          document.getElementById("editCategoryIcon").value =
            category.icon || "";

          const editCategoryModal = new bootstrap.Modal(
            document.getElementById("editCategoryModal")
          );
          editCategoryModal.show();
        }
      }
    });

  document.getElementById("confirmDeactivate").addEventListener("click", () => {
    if (categoryIdToDeactivate) {
      deactivateCategory(categoryIdToDeactivate);
    }
  });

  document.getElementById("confirmReactivate").addEventListener("click", () => {
    if (categoryIdToReactivate) {
      reactivateCategory(categoryIdToReactivate);
    }
  });

  function formatDate(dateString) {
    const date = new Date(dateString);
    const correctedDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000
    );
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return correctedDate.toLocaleDateString(undefined, options);
  }

  const sortSelect = document.getElementById("sortSelect");
  sortSelect.addEventListener("change", function () {
    const sortCriteria = sortSelect.value;
    const query = document.getElementById("search-categories").value;
    loadCategories(query, 0, 9, sortCriteria);
  });

  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const query = document.getElementById("search-categories").value;
    const sortCriteria = sortSelect.value;
    loadCategories(query, 0, 9, sortCriteria);
  });

  loadCategories();
});
