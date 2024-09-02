import config from "../environments/config.js";
import showToast from "./toast.js";

document.addEventListener("DOMContentLoaded", async () => {
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

export async function fetchVotingLimit() {
  try {
    const response = await fetch(config.api + "/voting", {
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
    const votingLimitElement = document.getElementById("votingLimit");
    votingLimitElement.textContent = data.available;
    votingLimitElement.style.backgroundColor =
      data.available < 1 ? "#eeeeee" : "#15a362";
  } catch (error) {
    showToast(error.message, "error");
  }
}

export async function fetchProposalLimit() {
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
    const proposalLimitElement = document.getElementById("proposalLimit");
    proposalLimitElement.textContent = data.available;

    proposalLimitElement.style.backgroundColor =
      data.available < 1 ? "#eeeeee" : "#5cb377";
  } catch (error) {
    showToast(error.message, "error");
  }
}
