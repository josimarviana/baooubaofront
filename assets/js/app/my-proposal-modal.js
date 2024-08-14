document.addEventListener("DOMContentLoaded", function () {
  const proposalModal = document.getElementById("proposalModal");

  if (!sessionStorage.getItem("jwt")) {
    window.location.href = "../errors/404.html";
    return;
  }

  proposalModal.addEventListener("show.bs.modal", async function (event) {
    const button = event.relatedTarget;
    const id = button.getAttribute("data-proposal-id");

    const apiUrl = `https://testes-apibaoounao.iftmparacatu.app.br/proposal/${id}`;

    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const modalTitle = proposalModal.querySelector("#proposalModalLabel");
      const proposalTitle = proposalModal.querySelector("#proposal-title");
      const proposalDescription = proposalModal.querySelector("#proposal-description");
      const proposalLikes = proposalModal.querySelector("#proposal-likes");
      const proposalSituation = proposalModal.querySelector("#proposal-situation");
      const proposalCategory = proposalModal.querySelector("#proposal-category");
      const imageContainer = proposalModal.querySelector("#image-container");

      const imageData = data.image;

      if (imageData) {
        const imageUrl = `data:image/jpeg;base64,${imageData}`;
        // Cria o elemento de imagem e define seu src
        const proposalImage = document.createElement("img");
        proposalImage.src = imageUrl;
        proposalImage.alt = "Imagem descritiva da proposta";
        proposalImage.classList.add("img-fluid", "rounded");

        // Limpa o contêiner e adiciona a imagem
        imageContainer.innerHTML = ""; // Limpa o conteúdo do contêiner
        imageContainer.appendChild(proposalImage); // Adiciona a nova imagem
        imageContainer.style.display = "flex"; // Mostra o contêiner da imagem
      } else {
        imageContainer.style.display = "none"; // Oculta o contêiner da imagem
      }

      modalTitle.textContent = "Criada em: " + new Date(data.createdAt).toLocaleDateString();
      proposalTitle.textContent = data.title;
      proposalDescription.textContent = data.description;
      proposalLikes.textContent = data.likes;

      // Remove classes anteriores
      proposalSituation.classList.remove("text-bg-info", "text-bg-success", "text-bg-primary", "text-bg-danger", "text-bg-warning");

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
