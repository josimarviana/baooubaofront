import showToast from "../app/toast.js";
import config from "../environments/config.js";
document.addEventListener("DOMContentLoaded", function () {
  const proposalModal = document.getElementById("proposalModal");

  if (!sessionStorage.getItem("jwt")) {
    window.location.href = "../errors/404.html";
    return;
  }

  let currentProposalId = null;

  proposalModal.addEventListener("show.bs.modal", async function (event) {
    const button = event.relatedTarget;
    const id = button.getAttribute("data-proposal-id");

    currentProposalId = id;

    try {
      const data = await fetchProposalData(id);
      updateModalContent(data);
    } catch (error) {
      showToast("Erro ao carregar dados da proposta", "error");
    }
  });

  proposalModal.addEventListener("hide.bs.modal", function () {
    clearModalContent();
  });

  function clearModalContent() {
    const modalTitle = proposalModal.querySelector("#proposalModalLabel");
    const proposalTitle = proposalModal.querySelector("#proposal-title");
    const proposalDescription = proposalModal.querySelector(
      "#proposal-description"
    );
    const proposalAuthor = proposalModal.querySelector("#proposal-author");
    const proposalCategory = proposalModal.querySelector("#proposal-category");
    const imageContainer = proposalModal.querySelector("#image-container");
    const proposalVideo = proposalModal.querySelector("#proposal-video");

    modalTitle.textContent = "";
    proposalTitle.textContent = "";
    proposalDescription.textContent = "";
    proposalAuthor.textContent = "";
    proposalCategory.textContent = "";

    imageContainer.innerHTML = "";
    imageContainer.style.display = "none";

    proposalVideo.innerHTML = "";
    proposalVideo.style.display = "none";
  }

  async function fetchProposalData(id) {
    const apiUrl = config.api + `/proposal/${id}`;
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
    });
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.mensagem || "Erro ao carregar proposta");
    }
    return await response.json();
  }

  function updateModalContent(data) {
    const modalTitle = proposalModal.querySelector("#proposalModalLabel");
    const proposalTitle = proposalModal.querySelector("#proposal-title");
    const proposalDescription = proposalModal.querySelector(
      "#proposal-description"
    );
    const proposalAuthor = proposalModal.querySelector("#proposal-author");
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

    modalTitle.textContent =
      "Criada em: " + new Date(data.createdAt).toLocaleDateString();
    proposalTitle.textContent = data.title;
    proposalDescription.innerHTML = data.description;
    proposalAuthor.textContent = "Autor: " + data.author;
    proposalCategory.textContent = data.category;

    const videoUrl = data.videoUrl;
    if (videoUrl) {
      const embedUrl = convertToEmbedUrl(videoUrl);
      proposalVideo.innerHTML = `<iframe width="100%" src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
      proposalVideo.style.display = "flex";
    } else {
      proposalVideo.style.display = "none";
    }
  }

  function convertToEmbedUrl(url) {
    const videoId = new URL(url).searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }
});
