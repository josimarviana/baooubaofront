import config from "../environments/config.js";

document.addEventListener("DOMContentLoaded", async () => {
    const proposalLimitElement = document.getElementById("proposalLimit");
    const votingLimitElement = document.getElementById("votingLimit");


    async function fetchProposalLimit() {
        try {
            const response = await fetch(config.api + "/proposal/limit", {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("jwt")}`
                }
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.mensagem || "Erro ao carregar limite de propostas");
            }

            const data = await response.json();
            proposalLimitElement.textContent = data.available;

        } catch (error) {
            console.error("Erro ao carregar limite de propostas:", error);
        }
    }


    async function fetchVotingLimit() {
        try {
            const response = await fetch(config.api + "/voting/limit", {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("jwt")}`
                }
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.mensagem || "Erro ao carregar limite de votos");
            }

            const data = await response.json();
            votingLimitElement.textContent = data.available;

        } catch (error) {
            console.error("Erro ao carregar limite de votos:", error);
        }
    }


    await fetchProposalLimit();
    await fetchVotingLimit();
});