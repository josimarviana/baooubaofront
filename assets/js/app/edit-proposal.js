import config from "../environments/config.js";
import showToast from "./toast.js";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("edit-proposal-form");
  const apiUrl = config.api + "/proposal";
  const categorySelect = document.getElementById("categorySelect");
  const proposalId = new URLSearchParams(window.location.search).get("id");

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

  async function loadProposalData() {
    try {
      const response = await fetch(`${apiUrl}/${proposalId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(
          errorResponse.mensagem || "Erro ao carregar dados da proposta"
        );
      }

      const proposal = await response.json();
      console.log(proposal);

      document.getElementById("proposal-title").value = proposal.title;
      quill.root.innerHTML = proposal.description || "";
      document.getElementById("proposal-url").value = proposal.videoUrl || "";

      const currentImageContainer = document.getElementById(
        "current-image-container"
      );
      const currentImage = document.getElementById("current-image");

      if (proposal.image) {
        currentImage.src = proposal.image;
        currentImageContainer.style.display = "block";
      } else {
        currentImageContainer.style.display = "none";
      }

      const categoryOption = Array.from(categorySelect.options).find(
        (option) => option.text === proposal.category
      );
      if (categoryOption) {
        categorySelect.value = categoryOption.value;
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  await loadActiveCategories();
  await loadProposalData();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!sessionStorage.getItem("jwt")) {
      console.error("JWT não encontrado no sessionStorage");
      return;
    }

    const formData = new FormData(form);

    const quillContent = quill.root.innerHTML;
    formData.set("description", quillContent);

    const selectedCategory =
      categorySelect.options[categorySelect.selectedIndex].text;
    formData.set("category", selectedCategory);

    try {
      const response = await fetch(`${apiUrl}/${proposalId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("jwt")}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensagem || "Erro ao atualizar proposta");
      }

      const result = await response.json();
      console.log("Proposta atualizada com sucesso:", result);
      showToast(result.mensagem, "success");
      window.location.href = "../../../pages/logged/my-proposal.html";
    } catch (error) {
      showToast(error.message, "error");
    }
  });
});
