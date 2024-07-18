document.addEventListener('DOMContentLoaded', function () {
    const proposalModal = document.getElementById('proposalModal');

    proposalModal.addEventListener('show.bs.modal', async function (event) {
        const button = event.relatedTarget; // Botão que acionou o modal
        const id = button.getAttribute('data-proposal-id');

        // Fazer a requisição à API para obter dados dinâmicos
        const apiUrl = `https://apibaoounao.iftmparacatu.app.br/proposal/${id}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Atualizar o modal com os dados dinâmicos obtidos da API
            const modalTitle = proposalModal.querySelector('#proposalModalLabel');
            const proposalTitle = proposalModal.querySelector('#proposal-title');
            const proposalDescription = proposalModal.querySelector('#proposal-description');
            const proposalLikes = proposalModal.querySelector('#proposal-likes');
            const proposalSituation = proposalModal.querySelector('#proposal-situation');
            const proposalAuthor = proposalModal.querySelector("#proposal-author");
            const proposalCategory = proposalModal.querySelector("#proposal-category");

            modalTitle.textContent = "Criada em: " + new Date(data.createdAt).toLocaleDateString();
            proposalTitle.textContent = data.title;
            proposalDescription.textContent = data.description;
            proposalLikes.textContent = data.likes;
            proposalSituation.textContent = data.situation;
            proposalAuthor.textContent = "Autor: " + data.userEntity.name;
            proposalCategory.textContent = "Precisa cadastrar categoria na proposta";
            

           

        } catch (error) {
            console.error('Erro ao obter dados da API:', error);
        }
    });
});