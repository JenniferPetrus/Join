document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    setupAddContactButton();
    setupCloseIcon();
}

function setupAddContactButton() {
    const addContactButton = document.querySelector('.add-contact-btn');
    if (addContactButton) {
        addContactButton.addEventListener('click', loadOverlay);
    } else {
        console.error('Add contact button not found');
    }
}

function setupCloseIcon() {
    const closeIcon = document.querySelector('.close-icon');
    if (closeIcon) {
        closeIcon.addEventListener('click', closeOverlay);
    } else {
        console.error('Close icon not found');
    }
}

function loadOverlay() {
    fetch('overlay.html')
        .then(response => response.text())
        .then(displayOverlay)
        .catch(handleError);
}

function displayOverlay(html) {
    const overlayContainer = document.getElementById('overlay-container');
    overlayContainer.innerHTML = html;
    showOverlay();
    setupCloseButton();
    setupBackgroundClick();
    setupCancelButton();
    setupCreateContactButton();
    setupCloseIcon(); 
}

function showOverlay() {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.classList.remove('hide');
        overlay.classList.add('show');
    } else {
        console.error('Overlay element not found');
    }
}

function setupCloseButton() {
    const closeButton = document.getElementById('overlay-close-btn');
    if (closeButton) {
        closeButton.addEventListener('click', closeOverlay);
    } else {
        console.error('Close button not found');
    }
}

function setupBackgroundClick() {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.addEventListener('click', function(event) {
            if (event.target === overlay) {
                closeOverlay();
            }
        });
    } else {
        console.error('Overlay element not found');
    }
}

function setupCancelButton() {
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', closeOverlay);
    } else {
        console.error('Cancel button not found');
    }
}

function clearInputFields() {
    const inputFields = document.querySelectorAll('.styled-input');
    inputFields.forEach(input => {
        input.value = '';
    });
}

function closeOverlay() {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.classList.remove('show');
        overlay.classList.add('hide');
        setTimeout(clearOverlayContent, 500);
    }
}

function clearOverlayContent() {
    const overlayContainer = document.getElementById('overlay-container');
    if (overlayContainer) {
        overlayContainer.innerHTML = '';
    }
}

function handleError(error) {
    console.error('Error loading overlay:', error);
}

// ADD NEW CONTACT
async function setupCreateContactButton() {
    const createContactButton = document.getElementById('createContactButton');
    if (createContactButton) {
        createContactButton.addEventListener('click', createContact);
    } else {
        console.error('Create contact button not found');
    }
}

async function createContact() {
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const phone = document.getElementById('contactPhone').value;

    if (name && email && phone) {
        const newContact = {
            Name: name,
            Email: email,
            Phone: phone
        };
        try {
            const contacts = await fetchData();
            const nextId = contacts.length;
            addContactToAPI(nextId, newContact);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    } else {
        alert('Please fill in all fields');
    }
}

function addContactToAPI(id, contact) {
    fetch(`${API_URL}/${id}.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(contact)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add contact');
        }
        return response.json();
    })
    .then(() => {
        loadData();
        closeOverlay();
        showSuccessMessage('Contact successfully added');
    })
    .catch(error => {
        console.error('Error adding contact:', error);
    });
}

async function fetchData() {
    let response = await fetch(`${API_URL}.json`);
    if (!response.ok) {
        throw new Error('Error fetching contacts');
    }
    let data = await response.json();
    if (typeof data !== 'object') {
        throw new Error('Unexpected data format');
    }
    let result = [];
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            result.push({ id: key, ...data[key] });
        }
    }
    return result;
}
