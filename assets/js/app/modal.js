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

  async function fetchProposalData(id) {
    const apiUrl = `https://apibaoounao.iftmparacatu.app.br/proposal/${id}`;
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json(); // Retorna o JSON diretamente
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
    const proposalImage = proposalModal.querySelector("#proposal-image");
    const defaultImageUrl = "../../../assets/images/BaoOuNao.png";

    modalTitle.textContent =
      "Criada em: " + new Date(data.createdAt).toLocaleDateString();
    proposalTitle.textContent = data.title;
    proposalDescription.textContent = data.description;
    proposalLikes.textContent = data.likes;
    proposalAuthor.textContent = "Autor: " + data.author;
    proposalCategory.textContent = data.category;

    proposalImage.src = data.image ?
      `data:image/jpeg;base64,${data.image}` :
      defaultImageUrl;
  }

  async function checkIfUserHasVoted(proposalId) {
    const apiUrl = `https://apibaoounao.iftmparacatu.app.br/proposal/has-voted/${proposalId}`;
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
    const url = hasVoted ?
      "https://apibaoounao.iftmparacatu.app.br/voting/unvote" :
      "https://apibaoounao.iftmparacatu.app.br/voting";
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

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Erro desconhecido";
        o

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
        hasVoted ?
        "Voto cancelado com sucesso!" :
        "Voto registrado com sucesso!"
      );


      hasVoted = !hasVoted;
      const voteButton = proposalModal.querySelector("#btn-vote");
      updateVoteButton(voteButton);


      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(proposalModal);
        modal.hide();
      }, 1500);
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

      const modal = bootstrap.Modal.getInstance(proposalModal);
      modal.hide();
    } catch (error) {
      console.error("Erro ao atualizar o modal após a votação:", error);
    }
  }
});