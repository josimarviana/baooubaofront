import config from "../environments/config.js";
import showToast from "./toast.js";

document.addEventListener("DOMContentLoaded", async () => {
  const proposalLimitElement = document.getElementById("proposalLimit");
  const votingLimitElement = document.getElementById("votingLimit");

  async function fetchProposalLimit() {
    try {
      const response = await fetch(config.api + "/proposal/limit", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(
          errorResponse.mensagem || "Erro ao carregar limite de propostas"
        );
      }

      const data = await response.json();
      proposalLimitElement.textContent = data.available;
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function fetchVotingLimit() {
    try {
      const response = await fetch(config.api + "/voting/limit", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(
          errorResponse.mensagem || "Erro ao carregar limite de votos"
        );
      }

      const data = await response.json();
      votingLimitElement.textContent = data.available;
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  await fetchProposalLimit();
  await fetchVotingLimit();

  // Adicione o redirecionamento para new-proposal.html
  const proposalIcon = document.querySelector(".app-utility-item a[href='#']");

  proposalIcon.addEventListener("click", (event) => {
    event.preventDefault(); // Evita o comportamento padrão do link

    // Verifica se há propostas restantes
    if (parseInt(proposalLimitElement.textContent) > 0) {
      // Redireciona para a página de nova proposta
      window.location.href = "new-proposal.html";
    } else {
      showToast("Você não tem propostas restantes.", "error");
    }
  });
});
