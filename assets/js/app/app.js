document.addEventListener("DOMContentLoaded", async function () {
  const jwt = sessionStorage.getItem("jwt");
  const userName = sessionStorage.getItem("userName");
  const userEmail = sessionStorage.getItem("userEmail");

  if (!jwt) {
    console.error("Usuário não autenticado. Redirecionando para o login.");
    window.location.href = "../erros/404.html"; // Redirecionar para a página de login
    return; // Interrompe a execução da função
  }

  ("use strict");

  const popoverTriggerList = document.querySelectorAll(
    "[data-bs-toggle=popover]"
  );
  const popoverList = [...popoverTriggerList].map(
    (popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl)
  );

  const alertList = document.querySelectorAll(".alert");
  const alerts = [...alertList].map((element) => new bootstrap.Alert(element));

  const sidePanelToggler = document.getElementById("sidepanel-toggler");
  const sidePanel = document.getElementById("app-sidepanel");
  const sidePanelDrop = document.getElementById("sidepanel-drop");
  const sidePanelClose = document.getElementById("sidepanel-close");

  window.addEventListener("load", function () {
    responsiveSidePanel();
  });
  window.addEventListener("resize", function () {
    responsiveSidePanel();
  });

  function responsiveSidePanel() {
    let w = window.innerWidth;
    if (w >= 1200) {
      sidePanel.classList.remove("sidepanel-hidden");
      sidePanel.classList.add("sidepanel-visible");
    } else {
      sidePanel.classList.remove("sidepanel-visible");
      sidePanel.classList.add("sidepanel-hidden");
    }
  }

  sidePanelToggler.addEventListener("click", () => {
    if (sidePanel.classList.contains("sidepanel-visible")) {
      console.log("visible");
      sidePanel.classList.remove("sidepanel-visible");
      sidePanel.classList.add("sidepanel-hidden");
    } else {
      console.log("hidden");
      sidePanel.classList.remove("sidepanel-hidden");
      sidePanel.classList.add("sidepanel-visible");
    }
  });

  sidePanelClose.addEventListener("click", (e) => {
    e.preventDefault();
    sidePanelToggler.click();
  });
  sidePanelDrop.addEventListener("click", (e) => {
    sidePanelToggler.click();
  });

  /* ========== Mobile search ============== */

  const searchMobileTrigger = document.querySelector(".search-mobile-trigger");
  const searchBox = document.querySelector(".app-search-box");

  searchMobileTrigger.addEventListener("click", () => {
    searchBox.classList.toggle("is-visible");
    let searchMobileTriggerIcon = document.querySelector(
      ".search-mobile-trigger-icon"
    );
    if (searchMobileTriggerIcon.classList.contains("fa-magnifying-glass")) {
      searchMobileTriggerIcon.classList.remove("fa-magnifying-glass");
      searchMobileTriggerIcon.classList.add("fa-xmark");
    } else {
      searchMobileTriggerIcon.classList.remove("fa-xmark");
      searchMobileTriggerIcon.classList.add("fa-magnifying-glass");
    }
  });
  document
    .getElementById("cancel-link")
    .addEventListener("click", function (event) {
      event.preventDefault();
      document.getElementById("hidden-reset-button").click();
      window.location.href = "../../pages/logged/my-proposal.html";
    });
});
function logout() {
  sessionStorage.removeItem("jwt");
  window.location.href = "../../index.html";
}
