document.addEventListener("DOMContentLoaded", function () {
  const proposalModal = document.getElementById("proposalModal");
  const jwt = sessionStorage.getItem("jwt");
  if (!jwt) {
    console.error("Usuário não autenticado. Redirecionando para o login.");
    window.location.href = "../errors/404.html"; // Redirecionar para a página de login
    return; // Interrompe a execução da função
  }
  let currentProposalId = null;
  let hasVoted = false;

  proposalModal.addEventListener("show.bs.modal", async function (event) {
    const button = event.relatedTarget; // Botão que acionou o modal
    const id = button.getAttribute("data-proposal-id");

    currentProposalId = id;
    // Fazer a requisição à API para obter dados dinâmicos
    const apiUrl = `https://apibaoounao.iftmparacatu.app.br/proposal/${id}`;
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

      // Atualizar o modal com os dados dinâmicos obtidos da API
      const modalTitle = proposalModal.querySelector("#proposalModalLabel");
      const proposalTitle = proposalModal.querySelector("#proposal-title");
      const proposalDescription = proposalModal.querySelector(
        "#proposal-description"
      );
      const proposalLikes = proposalModal.querySelector("#proposal-likes");
      // const proposalSituation = proposalModal.querySelector(
      //   "#proposal-situation"
      // );
      const proposalAuthor = proposalModal.querySelector("#proposal-author");
      const proposalCategory =
        proposalModal.querySelector("#proposal-category");
      const proposalImage = proposalModal.querySelector("#proposal-image");
      const defaultImageUrl = "../../../assets/images/BaoOuNao.png";
      const imageData = data.image;
      if (imageData) {
        const imageUrl = `data:image/jpeg;base64,${imageData}`;
        proposalImage.src = imageUrl;
      } else {
        proposalImage.src = defaultImageUrl;
      }

      proposalImage.onload = () => {
        console.log("Imagem carregada com sucesso!");
      };

      proposalImage.onerror = (error) => {
        console.error("Erro ao carregar a imagem:", error);
      };

      console.log(data);

      modalTitle.textContent =
        "Criada em: " + new Date(data.createdAt).toLocaleDateString();
      proposalTitle.textContent = data.title;
      proposalDescription.textContent = data.description;
      proposalLikes.textContent = data.likes;
      // proposalSituation.textContent = data.situation;
      proposalAuthor.textContent = "Autor: " + data.author;
      proposalCategory.textContent = data.category;

      //Verificar se o usuário ja votou nesta proposta
      hasVoted = data.hasVoted;
      const voteButton = proposalModal.querySelector("#btn-vote");
      updateVoteButton(voteButton);
    } catch (error) {
      console.error("Erro ao obter dados da API:", error);
    }
  });

  function updateVoteButton(button) {
    if (hasVoted) {
      button.classList.remove("app-btn-primary");
      button.textContent = "Desvotar";
      button.classList.add("app-btn-secondary");
    } else {
      button.classList.remove("app-btn-secondary");
      button.textContent = "Votar";
      button.classList.add("app-btn-primary");
    }
  }

  proposalModal.addEventListener("click", async function (event) {
    if (event.target && event.target.matches("#btn-vote")) {
      const button = event.target;
      const url = hasVoted
        ? "https://apibaoounao.iftmparacatu.app.br/proposal/voting/unvote"
        : "https://apibaoounao.iftmparacatu.app.br/proposal/voting";
      const method = hasVoted ? "DELETE" : "POST";

      try {
        const response = await fetch(url, {
          method: method,
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            proposalEntity: {
              id: currentProposalId,
            },
          }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log("Resposta da API: ", result);
        hasVoted = !hasVoted;
        updateVoteButton(button);
      } catch (error) {
        console.log("Erro ao processar votação: ", error);
      }
    }
  });
});
