import { auth } from '../firebase-config.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessageDiv = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const loginButton = document.getElementById('loginButton');
const buttonText = document.getElementById('buttonText');
const buttonSpinner = document.getElementById('buttonSpinner');

// Verificar si ya está logueado y enviarlo directo al admin
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = 'admin.html';
    }
});

const showError = (message) => {
    errorText.textContent = message;
    errorMessageDiv.classList.remove('hidden');
};

const hideError = () => {
    errorMessageDiv.classList.add('hidden');
};

const setLoading = (isLoading) => {
    if (isLoading) {
        buttonText.textContent = 'Verificando...';
        buttonSpinner.classList.remove('hidden');
        loginButton.disabled = true;
        loginButton.classList.add('opacity-75', 'cursor-not-allowed');
    } else {
        buttonText.textContent = 'ENTRAR AL PANEL';
        buttonSpinner.classList.add('hidden');
        loginButton.disabled = false;
        loginButton.classList.remove('opacity-75', 'cursor-not-allowed');
    }
};

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();
    setLoading(true);

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Login exitoso
        window.location.href = 'admin.html';
    } catch (error) {
        console.error("Error signing in:", error);
        let errorMsg = "Ocurrió un error al intentar acceder.";
        
        switch (error.code) {
            case 'auth/invalid-email':
                errorMsg = "El correo electrónico no es válido.";
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                errorMsg = "Correo o contraseña incorrectos.";
                break;
            case 'auth/too-many-requests':
                errorMsg = "Demasiados intentos fallidos. Intenta más tarde.";
                break;
        }
        
        showError(errorMsg);
        setLoading(false);
    }
});
