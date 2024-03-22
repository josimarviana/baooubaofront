document.getElementById('show-password').addEventListener('click', function () {
    var passwordField = document.getElementById('login-password');
    var passwordIcon = document.getElementById('show-pass-icon');
    var passwordFieldType = passwordField.getAttribute('type');
    if (passwordFieldType === 'password') {
        passwordField.setAttribute('type', 'text');
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
    } else {
        passwordField.setAttribute('type', 'password');
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');
    }
});
