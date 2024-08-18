import config from "../environments/config.js"
document.addEventListener("DOMContentLoaded", function () {
  const proposalModal = document.getElementById("proposalModal");

  if (!sessionStorage.getItem("jwt")) {
    window.location.href = "../errors/404.html";
    return;
  }

  proposalModal.addEventListener("show.bs.modal", async function (event) {
    const button = event.relatedTarget;
    const id = button.getAttribute("data-proposal-id");

    const apiUrl = `${config.api}/proposal/${id}`;

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
      const proposalVideo = proposalModal.querySelector("#proposal-video");


      const imageUrl = data.image;
      if (imageUrl) {
        const proposalImage = document.createElement("img");
        proposalImage.src = imageUrl;
        proposalImage.alt = "Imagem descritiva da proposta";
        proposalImage.classList.add("img-fluid", "rounded");

        imageContainer.innerHTML = "";
        imageContainer.appendChild(proposalImage);
        imageContainer.style.display = "flex";
      } else {
        imageContainer.style.display = "none";
      }


      modalTitle.textContent = "Criada em: " + new Date(data.createdAt).toLocaleDateString();
      proposalTitle.textContent = data.title;
      proposalDescription.textContent = data.description;
      proposalLikes.textContent = data.likes;


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


      const videoUrl = data.videoUrl;
      if (videoUrl) {

        const embedUrl = convertToEmbedUrl(videoUrl);
        proposalVideo.innerHTML = `<iframe width="100%" src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
        proposalVideo.style.display = "flex";
      } else {
        proposalVideo.style.display = "none";
      }
    } catch (error) {
      console.error("Erro ao obter dados da API:", error);
    }
  });
  proposalModal.addEventListener("hidden.bs.modal", function () {
    const modalTitle = proposalModal.querySelector("#proposalModalLabel");
    const proposalTitle = proposalModal.querySelector("#proposal-title");
    const proposalDescription = proposalModal.querySelector("#proposal-description");
    const proposalLikes = proposalModal.querySelector("#proposal-likes");
    const proposalSituation = proposalModal.querySelector("#proposal-situation");
    const proposalCategory = proposalModal.querySelector("#proposal-category");
    const imageContainer = proposalModal.querySelector("#image-container");
    const proposalVideo = proposalModal.querySelector("#proposal-video");

    modalTitle.textContent = "";
    proposalTitle.textContent = "";
    proposalDescription.textContent = "";
    proposalLikes.textContent = "";
    proposalSituation.textContent = "";
    proposalCategory.textContent = "";

    imageContainer.innerHTML = "";
    imageContainer.style.display = "none";

    proposalVideo.innerHTML = "";
    proposalVideo.style.display = "none";
  });

  function convertToEmbedUrl(url) {
    const videoId = new URL(url).searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }
});