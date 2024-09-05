import config from "../environments/config.js";
import showToast from "./toast.js";
import { fetchProposalLimit } from "./proposal-limit.js";

document.addEventListener("DOMContentLoaded", async () => {
  if (!sessionStorage.getItem("jwt")) {
    window.location.href = "../errors/404.html";
    return;
  }

  const form = document.getElementById("new-proposal-form");
  const apiUrl = config.api + "/proposal";
  const categorySelect = document.getElementById("categorySelect");

  const quill = new Quill("#editor-container", {
    theme: "snow",
    placeholder: "Descreva sua proposta...",
  });

  async function loadActiveCategories() {
    try {
      const response = await fetch(config.api + "/category/active", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(
          errorResponse.mensagem || "Erro ao carregar categorias ativas"
        );
      }

      const categories = await response.json();
      categorySelect.innerHTML = "";

      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.title;
        option.textContent = category.title;
        categorySelect.appendChild(option);
      });
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  await loadActiveCategories();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const quillContent = quill.root.innerHTML;
    formData.set("description", quillContent);

    const selectedCategory =
      categorySelect.options[categorySelect.selectedIndex].text;
    formData.set("category", selectedCategory);

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
        throw new Error(errorResponse.mensagem || "Erro desconhecido");
      }

      const result = await response.json();
      console.log("Proposta enviada com sucesso:", result);
      form.reset();
      quill.setContents([]);
      showToast(result.mensagem, "success");
      fetchProposalLimit();
      window.location.href = "../../../pages/logged/my-proposal.html";
    } catch (error) {
      showToast(error.message, "error");
    }
  });
});
