let API_URL = "https://join-d67a5-default-rtdb.europe-west1.firebasedatabase.app/1/users.json";

function logIn() {
    let email = document.getElementById('emailInput').value;
    let password = document.getElementById('passwordInput').value;
    authenticateUser(email, password);
}

function authenticateUser(email, password) {
    fetch(API_URL)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(function (data) {
            if (!data) {
                throw new Error('No data returned from the database');
            }
            console.log('Fetched user data:', data);

            // Durchlaufen der Benutzerdaten und Suche nach der Übereinstimmung
            let user = Object.values(data).find(function (user) {
                return user.email === email && user.password === password;
            });

            if (user) {
                console.log('User authenticated:', user);
                localStorage.setItem('activeUser', JSON.stringify(user));
                window.location.href = "./summary.html";
            } else {
                console.log('User not found or password incorrect');
                displayErrorMessage("Invalid login credentials. Please try again.");
            }
        })
        .catch(function (error) {
            console.error('Error during authentication:', error);
            displayErrorMessage("An error occurred. Please try again.");
        });
}

function displayErrorMessage(message) {
    let errorText = document.getElementById('failureTextInLogin');
    errorText.innerText = message;
}

function guestLogIn() {
    const guestUser = {
        fullName: 'Guest',
        email: '',
        color: '#A8A8A8' // Standardfarbe für den Gastbenutzer
    };
    localStorage.setItem('activeUser', JSON.stringify(guestUser));
    window.location.href = "./summary.html";
}


document.getElementById('togglePasswordVisibility').addEventListener('click', function() {
    let passwordInput = document.getElementById('passwordInput');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
});
