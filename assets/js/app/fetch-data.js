import config from "../environments/config.js";
import showToast from "./toast.js";


document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = config.api + "/proposal/filter";
  const apiUrlAnalytics = config.api + "/proposal/dashboard";
  let proposals = [];

  if (!sessionStorage.getItem("jwt")) {
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

  async function loadAnalyticsData() {
    try {
      const response = await fetch(apiUrlAnalytics, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || "Erro ao carregar dados");
      }
      const data = await response.json();
      updateAnalyticsCards(data);
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  function updateAnalyticsCards(data) {
    document.getElementById("openProposals").textContent = data.openProposals;
    document.getElementById("votes").textContent = data.votes;
    document.getElementById("deniedProposals").textContent =
      data.deniedProposals;
    document.getElementById("acceptedProposals").textContent =
      data.acceptedProposals;
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
              <div class="d-flex align-items-center">
                <div class="app-icon-holder me-2">
                  <i class="${item.icon}"></i>
                </div>
                <h4 class="app-card-title mb-0">${item.title}</h4>
              </div>
            </div>
          </div>
          <div class="app-card-body px-4">
            <div class="intro overflow-hidden" style="max-height: 5.6em;">
              ${item.description}
            </div>
          </div>
          <div class="app-card-footer p-4 mt-auto">
            <a class="btn app-btn-secondary" href="#" data-bs-toggle="modal" data-bs-target="#proposalModal" data-proposal-id="${item.id}">Visualizar</a>
          </div>
        </div>`;

      cardContainer.appendChild(newCard);
    });
  }

  const searchForm = document.querySelector(".app-search-form");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const searchInput = document.getElementById("app-search-form");
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
      case "option-4":
        sortCriteria = "least_votes";
        break;
      case "option-5":
        sortCriteria = "most_votes";
        break;
      case "option-6":
        sortCriteria = "most_votes&voted=show";
        break;
      default:
        sortCriteria = "";
        break;
    }
    loadProposals("", 0, 9, sortCriteria);
  });

  loadProposals();
  loadAnalyticsData();
});
