import config from "../environments/config.js"
import showToast from './toast.js';
document.addEventListener("DOMContentLoaded", function () {
  const apiUrl = `${config.api}/proposal/my-proposals`;
  const jwt = sessionStorage.getItem("jwt");

  let proposals = [];
  let proposalToDelete;

  if (!sessionStorage.getItem("jwt")) {
    console.error("Usuário não autenticado. Redirecionando para o login.");
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
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || "Erro ao carregar dados");
      }
      proposals = await response.json();
      displayProposals(proposals);
    } catch (error) {
      showToast(error.message, "error");
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
              <div class="d-flex align-items-center">
                <div class="app-icon-holder me-2">
                 <i class="${item.icon}"></i>
                </div>
                <h4 class="app-card-title mb-0">${item.title}</h4>
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
                  <li><a href="#" class="dropdown-item"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pencil me-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg> Editar</a></li>
                  <li><a href="#" class="dropdown-item delete-btn" data-proposal-id="${item.id}"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-trash me-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.059L11.882 4H4.118z"/></svg> Excluir</a></li>
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
  }

  function handleDeleteButtonClick(event) {
    const button = event.target.closest(".delete-btn");
    if (button) {
      proposalToDelete = button.getAttribute("data-proposal-id");
      showConfirmationModal();
    }
  }

  function showConfirmationModal() {
    const modal = new bootstrap.Modal(document.getElementById("confirmationModal"));
    modal.show();

    document.getElementById("confirmDelete").addEventListener("click", async function () {
      try {
        const response = await fetch(`${config.api}/proposal/${proposalToDelete}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.mensagem || "Erro ao carregar dados");
        }
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById("confirmationModal"));
        modalInstance.hide();
        loadProposals();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }
  loadProposals();
  document.getElementById("card-container").addEventListener("click", handleDeleteButtonClick);
});