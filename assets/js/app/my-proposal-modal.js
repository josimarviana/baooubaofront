document.addEventListener("DOMContentLoaded", function () {
  const proposalModal = document.getElementById("proposalModal");
  const jwt = sessionStorage.getItem("jwt");
  if (!jwt) {
    console.error("Usuário não autenticado. Redirecionando para o login.");
    window.location.href = "../errors/404.html"; // Redirecionar para a página de login
    return; // Interrompe a execução da função
  }

  proposalModal.addEventListener("show.bs.modal", async function (event) {
    const button = event.relatedTarget;
    const id = button.getAttribute("data-proposal-id");

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
      console.log(data);
      // Atualizar o modal com os dados dinâmicos obtidos da API
      const modalTitle = proposalModal.querySelector("#proposalModalLabel");
      const proposalTitle = proposalModal.querySelector("#proposal-title");
      const proposalDescription = proposalModal.querySelector(
        "#proposal-description"
      );
      const proposalLikes = proposalModal.querySelector("#proposal-likes");
      const proposalSituation = proposalModal.querySelector(
        "#proposal-situation"
      );
      const proposalAuthor = proposalModal.querySelector("#proposal-author");
      const proposalCategory =
        proposalModal.querySelector("#proposal-category");
      const proposalImage = proposalModal.querySelector("#proposal-image");

      const defaultImageUrl =
        "https://plus.unsplash.com/premium_photo-1676750395664-3ac0783ae2c2?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
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

      const situation = data.situation;
      switch (situation) {
        case "OPEN_FOR_VOTING":
          proposalSituation.textContent = "Em votação";
          proposalSituation.classList.add("text-bg-info");
          break;
        case "FORWARDED_TO_BOARD":
          proposalSituation.textContent = "Encaminhado para o conselho";
          proposalSituation.classList.add("text-bg-success");
          break;
        case "APPROVED":
          proposalSituation.textContent = "Deferido";
          proposalSituation.classList.add("text-bg-primary");
          break;
        case "DENIED":
          proposalSituation.textContent = "Indeferido";
          proposalSituation.classList.add("text-bg-danger");
          break;
        case "PENDING_MODERATION":
          proposalSituation.textContent = "Em análise";
          proposalSituation.classList.add("text-bg-warning");
          break;
        default:
          proposalSituation.textContent = "";
          proposalSituation.classList.add("bg-light");
          break;
      }

      proposalCategory.textContent = data.category;
    } catch (error) {
      console.error("Erro ao obter dados da API:", error);
    }
  });
});
