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

  const proposalIcon = document.querySelector(".app-utility-item a[href='#']");

  proposalIcon.addEventListener("click", (event) => {
    event.preventDefault();

    if (parseInt(proposalLimitElement.textContent) > 0) {
      window.location.href = "new-proposal.html";
    } else {
      showToast("Você não tem propostas restantes.", "error");
    }
  });
});
