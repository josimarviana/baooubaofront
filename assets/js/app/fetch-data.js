document.addEventListener("DOMContentLoaded", async function () {
  const apiUrl = "https://apibaoounao.iftmparacatu.app.br/proposal";
  const jwt = sessionStorage.getItem("jwt");
  if (!jwt) {
    // JWT não encontrado, redirecionar para o login (ou exibir mensagem de erro)
    console.error("Usuário não autenticado. Redirecionando para o login.");
    // window.location.href = 'login.html'; // Redirecionar para a página de login
    return; // Interrompe a execução da função
  }
  try {
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const cardContainer = document.getElementById("card-container");

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
                        <div class="intro">
                            ${item.description}
                        </div>
                    </div>
                    <div class="app-card-footer p-4 mt-auto">
                        <a class="btn app-btn-secondary" href="#" data-bs-toggle="modal" data-bs-target="#proposalModal" 
                        data-proposal-id="${item.id}">Visualizar</a>
                    </div>
                </div>`;
      cardContainer.appendChild(newCard);
    });
  } catch (error) {
    console.error("Erro ao obter dados da API:", error);
  }
});
