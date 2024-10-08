document.addEventListener("DOMContentLoaded", async function () {
  const roles = sessionStorage.getItem("roles");

  if (!sessionStorage.getItem("jwt")) {
    window.location.href = "../errors/404.html";
    return;
  }
  if (!sessionStorage.getItem("roles").includes("ROLE_ADMINISTRATO")) {
    const adminContent = document.querySelectorAll(".admin-content");
    adminContent.forEach((element) => {
      element.style.display = "none";
    });
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
      sidePanel.classList.remove("sidepanel-visible");
      sidePanel.classList.add("sidepanel-hidden");
    } else {
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

 
});

function logout() {
  sessionStorage.removeItem("jwt");
  sessionStorage.removeItem("roles");

  window.location.href = "../../index.html";
}