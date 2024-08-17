import config from '../environments/config.js'
document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = config.api + "/proposal/filter";
  const apiUrlAnalytics = config.api + "/proposal/dashboard";
  let proposals = [];

  if (!sessionStorage.getItem("jwt")) {
    window.location.href = "../errors/404.html";
    return;
  }

  async function loadProposals(query = "", page = 0, size = 9) {
    try {
      const response = await fetch(
        `${apiUrl}?contain=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      proposals = result.proposals;
      displayProposals(proposals);
      updatePagination(result.currentPage, result.totalPages);
    } catch (error) {
      console.error("Erro ao obter dados da API:", error);
    }
  }

  function updatePagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById("paginationContainer");
    paginationContainer.innerHTML = "";

    // Botão para a primeira página
    const firstPageButton = document.createElement("li");
    firstPageButton.className = `page-item ${currentPage === 0 ? 'disabled' : ''}`;
    firstPageButton.innerHTML = `<a class="btn app-btn-primary me-2" href="#" aria-label="Primeira" tabindex="-1">Primeira</a>`;
    if (currentPage > 0) {
      firstPageButton.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        loadProposals("", 0);
      });
    }
    paginationContainer.appendChild(firstPageButton);

    // Botão "Anterior"
    const prevButton = document.createElement("li");
    prevButton.className = `page-item ${currentPage === 0 ? 'disabled' : ''}`;
    prevButton.innerHTML = `<a class="btn app-btn-primary me-2" href="#" aria-label="Anterior" tabindex="-1">&laquo;</a>`;
    if (currentPage > 0) {
      prevButton.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        loadProposals("", currentPage - 1);
      });
    }
    paginationContainer.appendChild(prevButton);

    // Números das páginas
    for (let i = 0; i < totalPages; i++) {
      const pageButton = document.createElement("li");
      pageButton.className = `page-item ${i === currentPage ? 'active' : ''}`;
      pageButton.innerHTML = `<a class="btn app-btn-primary me-2" href="#">${i + 1}</a>`;
      pageButton.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        loadProposals("", i);
      });
      paginationContainer.appendChild(pageButton);
    }

    // Botão "Próxima"
    const nextButton = document.createElement("li");
    nextButton.className = `page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`;
    nextButton.innerHTML = `<a class="btn app-btn-primary me-2" href="#" aria-label="Próxima">&raquo;</a>`;
    if (currentPage < totalPages - 1) {
      nextButton.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        loadProposals("", currentPage + 1);
      });
    }
    paginationContainer.appendChild(nextButton);

    // Botão para a última página
    const lastPageButton = document.createElement("li");
    lastPageButton.className = `page-item ${currentPage >= totalPages - 1 ? 'disabled' : ''}`;
    lastPageButton.innerHTML = `<a class="btn app-btn-primary" href="#" aria-label="Última">Última</a>`;
    if (currentPage < totalPages - 1) {
      lastPageButton.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        loadProposals("", totalPages - 1);
      });
    }
    paginationContainer.appendChild(lastPageButton);
  }

  async function loadAnalyticsData() {
    try {
      const response = await fetch(apiUrlAnalytics, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      updateAnalyticsCards(data);
    } catch (error) {
      console.error("Erro ao obter dados analíticos:", error);
    }
  }

  function updateAnalyticsCards(data) {
    document.getElementById("openProposals").textContent = data.openProposals;
    document.getElementById("votes").textContent = data.votes;
    document.getElementById("deniedProposals").textContent = data.deniedProposals;
    document.getElementById("acceptedProposals").textContent = data.acceptedProposals;
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
                  <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-code-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                    <path fill-rule="evenodd" d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z" />
                  </svg>
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

  loadProposals();
  loadAnalyticsData();
});