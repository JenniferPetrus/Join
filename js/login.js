function logIn() {
    let email = document.getElementById('emailInput').value;
    let password = document.getElementById('passwordInput').value;
    if (validateForm(email, password)) {
        authenticateUser(email, password);
    }
}

// Eingabevalidierung
function validateForm(email, password) {
    let isValid = true;
    clearErrorMessages();
    if (!validateEmail(email)) {
        displayErrorMessage("Invalid email format.", "emailError");
        isValid = false;
    }
    if (password === "") {
        displayErrorMessage("Password cannot be empty.", "passwordError");
        isValid = false;
    }
    return isValid;
}

// Funktion zum Zurücksetzen der Fehlermeldungen
function clearErrorMessages() {
    document.getElementById('emailError').innerText = "";
    document.getElementById('passwordError').innerText = "";
    document.getElementById('failureTextInLogin').innerText = "";
}

function displayErrorMessage(message, elementId) {
    let errorElement = document.getElementById(elementId);
    errorElement.innerText = message;
    errorElement.classList.add('visible');
}

function clearErrorMessage(elementId) {
    let errorElement = document.getElementById(elementId);
    errorElement.innerText = "";
    errorElement.classList.remove('visible');
}

async function authenticateUser(email, password) {
    try {
        const rootKey = await getUserRootKey();  // Root-Schlüssel für Users abrufen
        if (!rootKey) {
            throw new Error('Root key for users not found');
        }

        const response = await fetch(`${API_URL}/${rootKey}/users.json`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (!data) {
            throw new Error('No data returned from the database');
        }

        let user = Object.values(data).find(function (user) {
            return user.email === email && user.password === password;
        });

        if (user) {
            localStorage.setItem('activeUser', JSON.stringify(user));
            window.location.href = "./summary.html";
        } else {
            displayErrorMessage("Invalid login. Please try again.", "failureTextInLogin");
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        displayErrorMessage("An error occurred. Please try again.", "failureTextInLogin");
    }
}

// Email-Validierungsfunktion
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Funktion für Gast-Login
function guestLogIn() {
    const guestUser = {
        fullName: 'Guest',
        email: '',
        color: '#A8A8A8' // Standardfarbe für den Gastbenutzer
    };
    localStorage.setItem('activeUser', JSON.stringify(guestUser));
    window.location.href = "./summary.html";
}

document.getElementById('togglePasswordVisibility').addEventListener('click', function () {
    let passwordInput = document.getElementById('passwordInput');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
});

function navToSignUp() {
    window.location.href = 'sign-up.html';
}
