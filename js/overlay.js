document.addEventListener('DOMContentLoaded', initializeOverlay);

function initializeOverlay() {
    setUpButtons();
}

function setUpButtons() {
    setAddContactButton();
}

function setAddContactButton() {
    let addContactButton = document.querySelector('.add-contact-btn');
    if (addContactButton) {
        addContactButton.onclick = loadAddContactOverlay;
    } else {
        console.error('Add contact button not found');
    }
}

function loadAddContactOverlay() {
    fetch('overlay.html')
        .then(function(response) {
            return response.text();
        })
        .then(function(html) {
            displayOverlay(html, 'Add contact');
            setCreateContactButton();
            setCancelButton();
        })
        .catch(handleError);
}

function displayOverlay(html, title) {
    let overlayContainer = document.getElementById('overlay-container');
    overlayContainer.innerHTML = html;

    let overlayTitle = document.querySelector('.text-bold');
    if (overlayTitle) {
        overlayTitle.textContent = title;
    }

    showOverlay();
}

function showOverlay() {
    let overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.classList.remove('hide');
        overlay.classList.add('show');
        setOverlayInteractions();
    } else {
        console.error('Overlay element not found');
    }
}

function setOverlayInteractions() {
    setOverlayCloseButton();
    setOverlayBackgroundClick();
}

function setOverlayCloseButton() {
    let closeButton = document.querySelector('.close-icon');
    if (closeButton) {
        closeButton.onclick = function() {
            closeOverlay(true);
        };
    } else {
        console.error('Close button not found');
    }
}

function setOverlayBackgroundClick() {
    let overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.onclick = function(event) {
            if (event.target === overlay) {
                closeOverlay(true);
            }
        };
    } else {
        console.error('Overlay element not found');
    }
}

function setCancelButton() {
    let cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.innerText = 'Cancel';
        cancelButton.onclick = closeOverlay;
    } else {
        console.error('Cancel button not found');
    }
}

function setCreateContactButton() {
    let createContactButton = document.getElementById('createContactButton');
    if (createContactButton) {
        createContactButton.innerText = 'Create contact';
        createContactButton.onclick = createContact;
    } else {
        console.error('Create contact button not found');
    }
}

function closeOverlay(updateRequired) {
    let overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.classList.remove('show');
        overlay.classList.add('hide');
        setTimeout(function() {
            clearOverlayContent();
            if (updateRequired) {
                loadData();
            }
        }, 500);
    }
}

function clearOverlayContent() {
    let overlayContainer = document.getElementById('overlay-container');
    if (overlayContainer) {
        overlayContainer.innerHTML = '';
    }
}

function handleError(error) {
    console.error('Error loading overlay:', error);
}

function createContact() {
    let name = document.getElementById('contactName').value;
    let email = document.getElementById('contactEmail').value;
    let phone = document.getElementById('contactPhone').value;

    clearValidationErrors();
    let isValid = validateInputs(name, email, phone);
    if (isValid) {
        let newContact = {
            Name: name,
            Email: email,
            Phone: phone
        };
        addContactToAPI(newContact);
    }
}

function validateInputs(name, email, phone) {
    let isValid = true;
    if (!/^[a-zA-Z\s]+$/.test(name)) {
        showValidationError('contactName', 'Name should contain only letters');
        isValid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showValidationError('contactEmail', 'Please enter a valid email address');
        isValid = false;
    }
    if (!/^\d+$/.test(phone)) {
        showValidationError('contactPhone', 'Phone Number should contain only numbers');
        isValid = false;
    }
    return isValid;
}

function showValidationError(inputId, message) {
    let inputElement = document.getElementById(inputId);
    let errorElement = document.createElement('div');
    errorElement.className = 'validation-error';
    errorElement.innerText = message;
    inputElement.parentNode.appendChild(errorElement);
}

function clearValidationErrors() {
    let errorElements = document.querySelectorAll('.validation-error');
    errorElements.forEach(function(element) {
        element.remove();
    });
}

function addContactToAPI(contact) {
    getNextId().then(function(nextId) {
        fetch(`${API_URL}/${nextId}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contact)
        })
        .then(async function(response) {
            if (response.ok) {
                await loadData();
                let newIndex = contactsData.findIndex(c => c.id === nextId.toString());
                showContactDetails(newIndex);
                showSuccessMessage('Contact successfully created');
                closeOverlay(false);
            } else {
                throw new Error('Failed to add contact');
            }
        })
        .catch(function(error) {
            console.error('Error adding contact:', error);
        });
    });
}

function getNextId() {
    return fetch(`${API_URL}.json`)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Error fetching contacts');
            }
            return response.json();
        })
        .then(function(data) {
            if (typeof data !== 'object') {
                throw new Error('Unexpected data format');
            }
            let ids = Object.keys(data).map(function(key) {
                let num = parseInt(key, 10);
                if (isNaN(num)) {
                    console.warn('Key is not a number:', key);
                }
                return num;
            }).filter(function(num) {
                return !isNaN(num);
            });

            return ids.length ? Math.max(...ids) + 1 : 1;
        })
        .catch(function(error) {
            console.error('Error in getNextId:', error);
            return 1;
        });
}
