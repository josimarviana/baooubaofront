export default function showToast(message, type) {
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


    setTimeout(() => {
        toast.hide();
    }, 3000);
}