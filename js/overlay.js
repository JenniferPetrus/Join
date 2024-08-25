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
        .then(response => response.text())
        .then(html => {
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
        void overlay.offsetWidth;
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
                loadData().then(function() {
                    setupContactClickHandlers(); 
                    setupEditDeleteButtons(); 
                    showEditDeleteButtons(); 
                });
            } else {
                showEditDeleteButtons(); 
                setupEditDeleteButtons(); 
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
            fullName: name,
            email: email,
            phone: phone
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

async function addContactToAPI(contact) {
    try {
        const rootKey = await getUserRootKey(); // Root-Schlüssel für Users abrufen
        if (!rootKey) {
            throw new Error('Root key for users not found');
        }

        const nextId = await getNextId();
        const userId = `user${nextId}`;
        console.log(`Creating new contact with ID: ${userId}`);

        const response = await fetch(`${API_URL}/${rootKey}/users/${userId}.json`, {  // Verwendung des Root-Schlüssels
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contact)
        });

        if (!response.ok) {
            throw new Error('Failed to add contact');
        }

        await loadData();
        let newIndex = contactsData.findIndex(c => c.id === userId);
        console.log(`New contact added at index: ${newIndex}`);
        showContactDetails(newIndex);
        showSuccessMessage('Contact successfully created');
        closeOverlay(false);
    } catch (error) {
        console.error('Error adding contact:', error);
    }
}

async function getNextId() {
    try {
        const rootKey = await getUserRootKey(); // Root-Schlüssel für Users abrufen
        if (!rootKey) {
            throw new Error('Root key for users not found');
        }

        const response = await fetch(`${API_URL}/${rootKey}/users.json`);
        if (!response.ok) {
            throw new Error('Error fetching contacts');
        }
        const data = await response.json();
        if (typeof data !== 'object') {
            throw new Error('Unexpected data format');
        }
        const ids = Object.keys(data).map(function(key) {
            const match = key.match(/^user(\d+)$/);
            return match ? parseInt(match[1], 10) : NaN;
        }).filter(function(num) {
            return !isNaN(num);
        });

        const nextId = ids.length ? Math.max(...ids) + 1 : 1;
        console.log(`Next ID: ${nextId}`);
        return nextId;
    } catch (error) {
        console.error('Error in getNextId:', error);
        return 1;
    }
}

async function setupEditContact() {
    const contact = contactsData[currentContactIndex];
    if (!contact) {
        console.error('No contact found for editing');
        return;
    }
    console.log('Editing contact:', contact);

    const overlayHTML = await fetch('overlay.html').then(response => response.text());

    const overlayContainer = document.getElementById('overlay-container');
    overlayContainer.innerHTML = overlayHTML;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            showOverlay();
        });
    });

    const overlayTitle = document.querySelector('.text-bold');
    if (overlayTitle) {
        overlayTitle.innerText = 'Edit Contact';
    }

    const overlaySubtitle = document.querySelector('.text-normal');
    if (overlaySubtitle) {
        overlaySubtitle.style.display = 'none';
    }

    const contactNameInput = document.getElementById('contactName');
    const contactEmailInput = document.getElementById('contactEmail');
    const contactPhoneInput = document.getElementById('contactPhone');

    if (contactNameInput) contactNameInput.value = contact.fullName;
    if (contactEmailInput) contactEmailInput.value = contact.email;
    if (contactPhoneInput) contactPhoneInput.value = contact.phone;

    setEditCancelButton();
    setSaveContactButton(contact.id);

    const contactChangeElement = document.querySelector('.contact-change');
    if (contactChangeElement) {
        contactChangeElement.style.display = 'none';
    }

    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', closeEditContact);
    }
}

function closeEditContact() {
    closeOverlay();
}

function reloadPage() {
    document.body.innerHTML = '';
    fetch('contacts.html')
        .then(response => response.text())
        .then(html => {
            document.body.innerHTML = html;
            init();
        })
        .catch(error => console.error('Error loading contacts page:', error));
}

function setEditCancelButton() {
    let cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.innerText = 'Delete';
        cancelButton.onclick = clearInputFields;
    } else {
        console.error('Cancel button not found');
    }
}

function setSaveContactButton(contactId) {
    let saveContactButton = document.getElementById('createContactButton');
    if (saveContactButton) {
        saveContactButton.innerText = 'Save';
        saveContactButton.onclick = function() {
            saveContact(contactId);
        };
    } else {
        console.error('Save contact button not found');
    }
}

async function saveContact(contactId) {
    const contactNameInput = document.getElementById('contactName');
    const contactEmailInput = document.getElementById('contactEmail');
    const contactPhoneInput = document.getElementById('contactPhone');

    if (!contactNameInput || !contactEmailInput || !contactPhoneInput) {
        console.error('Contact input fields not found');
        return;
    }

    const updatedContact = {
        fullName: contactNameInput.value,
        email: contactEmailInput.value,
        phone: contactPhoneInput.value
    };

    try {
        await updateContactInAPI(contactId, updatedContact);
        showSuccessMessage('Contact successfully edited');
        closeOverlay(true);
    } catch (error) {
        console.error('Error updating contact:', error);
    }
}

async function updateContactInAPI(contactId, contact) {
    try {
        const rootKey = await getUserRootKey(); // Root-Schlüssel für Users abrufen
        if (!rootKey) {
            throw new Error('Root key for users not found');
        }

        const sanitizedContact = {
            fullName: contact.fullName || '',
            email: contact.email || '',
            phone: contact.phone || ''
        };

        const response = await fetch(`${API_URL}/${rootKey}/users/${contactId}.json`, {  // Verwendung des Root-Schlüssels
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sanitizedContact)
        });

        if (!response.ok) {
            throw new Error('Failed to update contact');
        }

        await loadData();
        showContactDetails(currentContactIndex);
    } catch (error) {
        console.error('Error updating contact:', error);
    }
}

async function fetchData() {
    try {
        const rootKey = await getUserRootKey(); // Root-Schlüssel für Users abrufen
        if (!rootKey) {
            throw new Error('Root key for users not found');
        }

        const response = await fetch(`${API_URL}/${rootKey}/users.json`);
        if (!response.ok) {
            throw new Error('Error fetching contacts');
        }

        const data = await response.json();
        if (typeof data !== 'object') {
            throw new Error('Unexpected data format');
        }

        const result = [];
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                result.push({ id: key, ...data[key] });
            }
        }

        console.log("Fetched contacts data:", result);
        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function deleteContact(contactId) {
    try {
        const rootKey = await getUserRootKey(); // Root-Schlüssel für Users abrufen
        if (!rootKey) {
            throw new Error('Root key for users not found');
        }

        console.log(`Attempting to delete contact with ID: ${contactId}`);
        const response = await fetch(`${API_URL}/${rootKey}/users/${contactId}.json`, {  // Verwendung des Root-Schlüssels
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete contact');
        }

        console.log(`Deleted contact with ID: ${contactId}`);
        await loadData();
        hideChosenContact();
        showSuccessMessage('Contact successfully deleted');
    } catch (error) {
        console.error('Error deleting contact:', error);
    }
}

function hideChosenContact() {
    let chosenContact = document.getElementById('chosenContacts');
    chosenContact.style.display = 'none';
}

function showSuccessMessage(message) {
    let messageContainer = document.createElement('div');
    messageContainer.className = 'success-message';
    messageContainer.innerText = message;

    document.body.appendChild(messageContainer);

    setTimeout(() => {
        messageContainer.remove();
    }, 3000);
}

function clearInputFields() {
    document.getElementById('contactName').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactPhone').value = '';
    document.getElementById('contactName').placeholder = 'Name';
    document.getElementById('contactEmail').placeholder = 'Email';
    document.getElementById('contactPhone').placeholder = 'Phone';
}

document.addEventListener('DOMContentLoaded', function() {
    const editDeleteSettingButton = document.querySelector('.edit-delete-setting');
    const contactChangeElement = document.querySelector('.contact-change');
    editDeleteSettingButton.addEventListener('click', function(event) {
        event.preventDefault();
        if (window.innerWidth <= 700) {
            if (contactChangeElement.style.display === 'none') {
                contactChangeElement.style.display = 'flex';
            } else {
                contactChangeElement.style.display = 'none';
            }
        }
    });

    document.querySelectorAll('.single-contact').forEach((contact, index) => {
        contact.addEventListener('click', () => showContactDetails(index));
    });
});

function init() {
    loadData().then(() => {
        document.querySelectorAll('.single-contact').forEach((contact, index) => {
            contact.addEventListener('click', () => showContactDetails(index));
        });
    });
}
