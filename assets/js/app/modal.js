import config from "../environments/config.js";
import { fetchVotingLimit } from "./proposal-limit.js";
document.addEventListener("DOMContentLoaded", function () {
  const proposalModal = document.getElementById("proposalModal");

  if (!sessionStorage.getItem("jwt")) {
    console.error("Usuário não autenticado. Redirecionando para o login.");
    window.location.href = "../errors/404.html";
    return;
  }

  let currentProposalId = null;
  let hasVoted = false;

  proposalModal.addEventListener("show.bs.modal", async function (event) {
    const button = event.relatedTarget;
    const id = button.getAttribute("data-proposal-id");

    currentProposalId = id;

    try {
      const data = await fetchProposalData(id);
      updateModalContent(data);
      await checkIfUserHasVoted(id);
    } catch (error) {
      console.error("Erro ao carregar dados da proposta:", error);
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
    const proposalLikes = proposalModal.querySelector("#proposal-likes");
    const proposalAuthor = proposalModal.querySelector("#proposal-author");
    const proposalCategory = proposalModal.querySelector("#proposal-category");
    const imageContainer = proposalModal.querySelector("#image-container");
    const proposalVideo = proposalModal.querySelector("#proposal-video");

    // Limpa o conteúdo do modal
    modalTitle.textContent = "";
    proposalTitle.textContent = "";
    proposalDescription.textContent = "";
    proposalLikes.textContent = "";
    proposalAuthor.textContent = "";
    proposalCategory.textContent = "";

    // Remove a imagem e esconde o contêiner
    imageContainer.innerHTML = "";
    imageContainer.style.display = "none";

    // Remove o vídeo e esconde o contêiner
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  function updateModalContent(data) {
    const modalTitle = proposalModal.querySelector("#proposalModalLabel");
    const proposalTitle = proposalModal.querySelector("#proposal-title");
    const proposalDescription = proposalModal.querySelector(
      "#proposal-description"
    );
    const proposalLikes = proposalModal.querySelector("#proposal-likes");
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
    proposalLikes.textContent = data.likes;
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

  async function checkIfUserHasVoted(proposalId) {
    const apiUrl = config.api + `/proposal/has-voted/${proposalId}`;
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
      hasVoted = data.hasVoted;
      updateVoteButton();
    } catch (error) {
      console.error("Erro ao verificar se o usuário votou:", error);
    }
  }

  function updateVoteButton() {
    const voteButton = proposalModal.querySelector("#btn-vote");
    if (hasVoted) {
      voteButton.classList.remove("app-btn-primary");
      voteButton.classList.add("app-btn-danger");
      voteButton.innerHTML = '<i class="fa-regular fa-thumbs-down"></i> Não';
    } else {
      voteButton.classList.remove("app-btn-danger");
      voteButton.classList.add("app-btn-primary");
      voteButton.innerHTML = '<i class="fa-regular fa-thumbs-up"></i> Bão';
    }
  }

  proposalModal.addEventListener("click", async function (event) {
    if (event.target && event.target.matches("#btn-vote")) {
      try {
        await handleVote();
        await updateModalAfterVote();
      } catch (error) {
        console.error("Erro ao processar votação:", error);
      }
    }
  });

  async function handleVote() {
    const url = hasVoted
      ? config.api + "/voting/unvote"
      : config.api + "/voting";
    const method = hasVoted ? "DELETE" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
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
        const errorText = await response.text();
        let errorMessage = "Erro desconhecido";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.mensagem || "Erro desconhecido";
        } catch (jsonError) {
          console.error("Erro ao processar JSON de erro:", jsonError);
        }

        console.error("Erro ao processar votação:", errorText);
        showToast(`Erro: ${errorMessage}`, "error");
        return;
      }

      showToast(
        hasVoted
          ? "Voto cancelado com sucesso!"
          : "Voto registrado com sucesso!"
      );
      hasVoted = !hasVoted;
      updateVoteButton();

      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(proposalModal);
        modal.hide();
      }, 3000);

      fetchVotingLimit();
    } catch (error) {
      console.error("Erro ao processar votação:", error);
      showToast(
        "Erro ao processar votação. Por favor, tente novamente.",
        "error"
      );
    }
  }

  function showToast(message, type = "success") {
    const toastElement = document.getElementById("confirmationToast");
    const toastBody = document.getElementById("toast-body");

    toastBody.textContent = message;

    toastElement.classList.remove("text-success", "text-danger");

    if (type === "success") {
      toastElement.classList.add("text-primary");
    } else if (type === "error") {
      toastElement.classList.add("text-danger");
    }

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }

  async function updateModalAfterVote() {
    try {
      const data = await fetchProposalData(currentProposalId);
      updateModalContent(data);
      updateVoteButton();
      
      fetchVotingLimit();

      const modal = bootstrap.Modal.getInstance(proposalModal);
      modal.hide();
    } catch (error) {
      console.error("Erro ao atualizar o modal após a votação:", error);
    }
  }

  function convertToEmbedUrl(url) {
    const videoId = new URL(url).searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  }
});
