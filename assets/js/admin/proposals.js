document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = "https://testes-apibaoounao.iftmparacatu.app.br/proposal";

  let proposals = [];

  if (!sessionStorage.getItem("jwt")) {
    window.location.href = "../errors/404.html";
    return;
  }
  if (!sessionStorage.getItem("roles").includes("ROLE_ADMINISTRATOR")) {
    window.location.href = "../errors/404.html";
    return;
  }

  async function loadProposals() {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      proposals = await response.json();
      displayProposals(proposals);
    } catch (error) {
      console.error("Erro ao obter dados da API: ", error);
      showToast("Erro ao carregar propostas. Tente novamente.");
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
                  <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-code-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                    <path fill-rule="evenodd" d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z" />
                  </svg>
                </div>
              </div>
              <div class="col-auto">
                <h4 class="app-card-title">${item.title}</h4>
              </div>
            </div>
          </div>
          <div class="app-card-body px-4">
            <div class="intro">${item.description}</div>
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
    dropdownItems.forEach(item => {
      item.addEventListener("click", handleDropdownItemClick);
    });
  }

  async function handleDropdownItemClick(event) {
    event.preventDefault();
    const action = event.target.dataset.action;
    const id = event.target.dataset.id;
    const url = `https://testes-apibaoounao.iftmparacatu.app.br/proposal/moderate/${action}/${id}`;

    try {
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      showToast(result.mensagem);


      loadProposals();
    } catch (error) {
      console.error("Erro ao atualizar proposta: ", error);
      showToast("Erro ao atualizar proposta. Tente novamente.");
    }
  }

  function showToast(message) {
    const toastBody = document.getElementById("toast-body");
    toastBody.textContent = message;
    const toast = new bootstrap.Toast(document.getElementById("confirmationToast"));
    toast.show();
  }

  loadProposals();
});