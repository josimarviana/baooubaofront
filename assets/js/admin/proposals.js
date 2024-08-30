import config from "../environments/config.js";
import showToast from "../app/toast.js";

document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = config.api + "/proposal/adm";
  let proposals = [];

  if (!sessionStorage.getItem("jwt")) {
    window.location.href = "../errors/404.html";
    return;
  }
  if (!sessionStorage.getItem("roles").includes("ROLE_ADMINISTRATOR")) {
    window.location.href = "../errors/404.html";
    return;
  }

  async function loadProposals(query = "", page = 0, size = 9, sort = "") {
    try {
      const response = await fetch(
        `${apiUrl}?contain=${encodeURIComponent(
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
        throw new Error(errorResponse.mensagem || "Erro ao carregar dados");
      }

      const result = await response.json();
      proposals = result.proposals;

      displayProposals(proposals);
      updatePagination(result.currentPage, result.totalPages);
    } catch (error) {
      showToast(error.message, "error");
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
        loadProposals("", 0);
      });
      paginationContainer.appendChild(firstPageButton);
    }

    if (currentPage > 0) {
      const prevButton = document.createElement("li");
      prevButton.className = "page-item";
      prevButton.innerHTML = `<a class="btn app-btn-primary me-2" href="#" aria-label="Anterior">&laquo;</a>`;
      prevButton.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        loadProposals("", currentPage - 1);
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
        loadProposals("", i);
      });
      paginationContainer.appendChild(pageButton);
    }

    if (currentPage < totalPages - 1) {
      const nextButton = document.createElement("li");
      nextButton.className = "page-item";
      nextButton.innerHTML = `<a class="btn app-btn-primary me-2" href="#" aria-label="Próxima">&raquo;</a>`;
      nextButton.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        loadProposals("", currentPage + 1);
      });
      paginationContainer.appendChild(nextButton);
    }

    if (currentPage < totalPages - 1) {
      const lastPageButton = document.createElement("li");
      lastPageButton.className = "page-item";
      lastPageButton.innerHTML = `<a class="btn app-btn-primary" href="#" aria-label="Última">Última</a>`;
      lastPageButton.querySelector("a").addEventListener("click", (e) => {
        e.preventDefault();
        loadProposals("", totalPages - 1);
      });
      paginationContainer.appendChild(lastPageButton);
    }
  }
  function displayProposals(data) {
    const cardContainer = document.getElementById("card-container");
    cardContainer.innerHTML = "";

    data.forEach((item) => {
      const newCard = document.createElement("div");
      newCard.className = "col-12 col-lg-4";
      newCard.innerHTML = `
        <div class="app-card app-card-basic d-flex flex-column align-items-start shadow-sm">
          <div class="app-card-header p-3 border-bottom-0">
            <div class="row align-items-center gx-3">
              <div class="col-auto">
                <div class="app-icon-holder">
                  <i class="${item.icon}"></i>
                </div>
              </div>
              <div class="col-auto">
                <h4 class="app-card-title">${item.title}</h4>
              </div>
            </div>
          </div>
          <div class="app-card-body px-4">
            <div class="intro overflow-hidden" style="max-height: 5.6em;">${item.description}</div>
            <div class="app-card-actions">
              <div class="dropdown">
                <div class="dropdown-toggle no-toggle-arrow" data-bs-toggle="dropdown" aria-expanded="false">
                  <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-three-dots-vertical" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                  </svg>
                </div>
                <ul class="dropdown-menu">
                  <li><a href="#" class="dropdown-item text-primary" data-action="approve" data-id="${item.id}"><i class="fa-regular fa-thumbs-up"></i> Aprovar</a></li>
                  <li><a href="#" class="dropdown-item text-danger" data-action="deny" data-id="${item.id}"><i class="fa-regular fa-thumbs-down"></i> Recusar</a></li>
                  <li>
                    <hr class="dropdown-divider">
                  </li>
                  <li><a href="#" class="dropdown-item text-info" data-action="board" data-id="${item.id}"><i class="fa-solid fa-check-double"></i> Encaminhar para conselho</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div class="app-card-footer p-4 mt-auto">
            <a class="btn app-btn-secondary" href="#" data-bs-toggle="modal" data-bs-target="#proposalModal" data-proposal-id="${item.id}">Visualizar</a>
          </div>
        </div>
      `;
      cardContainer.appendChild(newCard);
    });

    const dropdownItems = document.querySelectorAll(".dropdown-item");
    dropdownItems.forEach((item) => {
      item.addEventListener("click", handleDropdownItemClick);
    });
  }

  const searchForm = document.querySelector(".table-search-form");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const searchInput = document.getElementById("search-proposals");
    const query = searchInput.value.trim();
    loadProposals(query);
  });

  const sortSelect = document.getElementById("sortSelect");
  sortSelect.addEventListener("change", function () {
    const selectedOption = sortSelect.options[sortSelect.selectedIndex].value;
    let sortCriteria = "";

    switch (selectedOption) {
      case "option-2":
        sortCriteria = "recent";
        break;
      case "option-3":
        sortCriteria = "oldest";
        break;
      default:
        sortCriteria = "";
        break;
    }
    loadProposals("", 0, 9, sortCriteria);
  });

  async function handleDropdownItemClick(event) {
    event.preventDefault();
    const action = event.target.dataset.action;
    const id = event.target.dataset.id;
    const url = `${apiUrl}/moderate/${action}/${id}`;

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.mensagem || "Erro desconhecido");
      }

      showToast(result.mensagem, "success");
      loadProposals();
    } catch (error) {
      console.error("Erro ao atualizar proposta: ", error);
      showToast(error.message, "error");
    }
  }

  loadProposals();
});
