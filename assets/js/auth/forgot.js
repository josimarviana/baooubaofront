import config from "../environments/config.js";
import showToast from "../app/toast.js";

const apiUrl = config.api + "/user/email";

const forgotForm = document.getElementById("forgotForm");
forgotForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("forgot-email").value;

  
    const urlWithParams = `${apiUrl}/${encodeURIComponent(email)}`;

    try {
        const response = await fetch(urlWithParams, {
            method: "GET", 
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(
                errorResponse.mensagem || "Erro ao enviar email. Verifique os dados e tente novamente."
            );
        }

        const result = await response.json();
        showToast(result.mensagem || "Email enviado, verifique sua caixa de mensagens!", "success");
    } catch (error) {
        showToast(error.message, "error");
    }
});
