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
      const imageContainer = proposalModal.querySelector("#image-container");

      const defaultImageUrl = "../../../assets/images/BaoOuNao.png";
      const imageData = data.image;

      if (imageData) {
        const imageUrl = `data:image/jpeg;base64,${imageData}`;
        proposalImage.src = imageUrl;
        imageContainer.style.display = "flex"; // Mostra o contêiner da imagem
      } else {
        imageContainer.style.display = "none"; // Oculta o contêiner da imagem
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