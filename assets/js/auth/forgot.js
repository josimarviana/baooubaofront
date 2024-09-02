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
    
        const contentType = response.headers.get("content-type");
        let message;

        if (contentType && contentType.includes("application/json")) {
            const result = await response.json();
            message = result.mensagem || "Email enviado, verifique sua caixa de mensagens!";
        } else {
            message = await response.text();
        }

        showToast(message, "success");
        forgotForm.reset();
        setTimeout(() => {
            window.location.href = "../../index.html"; 
        }, 2000);

    } catch (error) {
        showToast(error.message, "error");
    }
});
