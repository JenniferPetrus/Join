document.getElementById("registerBtn").addEventListener("click", function (event) {
    event.preventDefault();
    clearErrorMessages();

    let fullName = document.getElementById('inputName').value.trim();
    let email = document.getElementById('inputEmail').value.trim();
    let password = document.getElementById('inputPassword').value.trim();
    let confirmPassword = document.getElementById('inputConfirmPassword').value.trim();

    if (!validateForm(fullName, email, password, confirmPassword)) {
        return;
    }

    registerUser(fullName, email, password);
});

function validateForm(fullName, email, password, confirmPassword) {
    let isValid = true;
    if (fullName === "" || containsCode(fullName)) {
        displayErrorMessage("Name cannot be empty or contain code.", "nameError");
        isValid = false;
    }
    if (!validateEmail(email)) {
        displayErrorMessage("Invalid email format.", "emailError");
        isValid = false;
    }
    if (password === "" || containsCode(password)) {
        displayErrorMessage("Password cannot be empty or contain code.", "passwordError");
        isValid = false;
    }
    if (password !== confirmPassword) {
        displayErrorMessage("Passwords do not match.", "confirmPasswordError");
        isValid = false;
    }
    return isValid;
}

function validateEmail(email) {
    let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email) && !containsCode(email);
}

function containsCode(input) {
    let codePattern = /<|>|script|alert|{|}/i;
    return codePattern.test(input);
}

function displayErrorMessage(message, elementId) {
    let errorElement = document.getElementById(elementId);
    errorElement.innerText = message;
    errorElement.classList.add('visible');
}

function clearErrorMessages() {
    let errorElements = document.getElementsByClassName("error-message");
    for (let i = 0; i < errorElements.length; i++) {
        errorElements[i].classList.remove('visible');
        errorElements[i].innerText = "";
    }
}


function registerUser(fullName, email, password) {
    fetch(`${API_URL}/1/users.json`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            let userExists = Object.values(data || {}).some(function (user) {
                return user.email === email;
            });

            if (userExists) {
                displayErrorMessage("E-Mail already in use. Please try another.", "emailError");
            } else {
                let newUserId = getNextUserId(data || {});
                createUser(newUserId, fullName, email, password);
            }
        })
        .catch(function (error) {
            displayErrorMessage("An error occurred. Please try again.", "nameError");
        });
}

function getNextUserId(users) {
    let userIds = Object.keys(users).map(function (key) {
        return parseInt(key.replace("user", ""), 10);
    }).filter(function (id) {
        return !isNaN(id);
    });

    return userIds.length > 0 ? Math.max(...userIds) + 1 : 1;
}

function createUser(userId, fullName, email, password) {
    let newUser = {
        id: `user${userId}`,
        fullName: fullName,
        email: email,
        password: password,
        linkedContacts: {},
        color: getRandomColor()
    };

    fetch(`${API_URL}/1/users/user${userId}.json`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
    })
    .then(function(response) {
        if (response.ok) {
            displayErrorMessage("New user created successfully.", "nameError");
            setTimeout(backToLogIn, 2000);
        } else {
            throw new Error("Failed to create user");
        }
    })
    .catch(function (error) {
        displayErrorMessage("An error occurred. Please try again.", "nameError");
    });
}

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function backToLogIn() {
    window.location.href = "login.html";
}
