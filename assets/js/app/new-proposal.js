import config from "../environments/config.js"

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("new-proposal-form");
  const apiUrl = config.api + "/proposal";
  const categorySelect = document.getElementById("categorySelect");

  // Função para carregar as categorias ativas e preencher o select
  async function loadActiveCategories() {
    try {
      const response = await fetch(config.api + "/category/active", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`
        }
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || "Erro ao carregar categorias ativas");
      }

      const categories = await response.json();

      // Limpa o select antes de adicionar as novas opções
      categorySelect.innerHTML = "";

      // Preenche o select com as categorias ativas
      categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.title; // Agora o value é o nome da categoria
        option.textContent = category.title;
        categorySelect.appendChild(option);
      });

    } catch (error) {
      console.error("Erro ao carregar categorias ativas:", error);
      showToast(error.message, "error");
    }
  }

  // Chama a função para carregar as categorias ao carregar a página
  await loadActiveCategories();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!sessionStorage.getItem("jwt")) {
      console.error("JWT não encontrado no sessionStorage");
      return;
    }

    const formData = new FormData(form);

    // Substitua o valor da categoria pelo nome da categoria
    const selectedCategory = categorySelect.options[categorySelect.selectedIndex].text;
    formData.set("category", selectedCategory); // Define o nome da categoria no formData

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || 'Erro desconhecido');
      }

      const result = await response.json();
      console.log("Proposta enviada com sucesso:", result);
      form.reset();
      showToast(result.mensagem, "success");
      window.location.href = "../../../pages/logged/my-proposal.html";
    } catch (error) {
      console.error("Erro ao enviar proposta:", error);
      showToast(error.message, "error");
    }
  });

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
});
