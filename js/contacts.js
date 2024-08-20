let API_URL = "https://join-d67a5-default-rtdb.europe-west1.firebasedatabase.app/";
let contactsData = [];
let contactColors = {};
let currentContactIndex = null;
let selectedContact = null;

const colors = [
    '#A8A8A8', '#D1D1D1', '#CDCDCD', '#007CEE', '#FF7A00', '#FF5EB3',
    '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E',
    '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'
];

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function getInitials(name) {
    let nameParts = name.split(' ');
    let initials = '';
    for (let i = 0; i < nameParts.length && initials.length < 2; i++) {
        initials += nameParts[i].charAt(0).toUpperCase();
    }
    return initials;
}

function assignColorIfNeeded(contact) {
    if (!contact.color || contact.color === "null") {
        contact.color = getRandomColor();
        saveColorToDatabase(contact.id, contact.color);
    }
}

function saveColorToDatabase(contactId, color) {
    fetch(`${API_URL}1/users/${contactId}/color.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(color)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to save color to database');
        }
    }).catch(error => {
        console.error('Error saving color:', error);
    });
}

function applyColor(contact) {
    return contact.color;
}

async function fetchData() {
    try {
        let response = await fetch(`${API_URL}.json`);
        if (!response.ok) {
            throw new Error('Error fetching contacts');
        }
        let data = await response.json();
        if (!data || !data[1] || !data[1].users) {
            throw new Error('No data found or unexpected data format');
        }
        let result = [];
        for (let key in data[1].users) {
            if (data[1].users.hasOwnProperty(key)) {
                let user = { id: key, ...data[1].users[key] };
                assignColorIfNeeded(user);
                result.push(user);
            }
        }
        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function loadData() {
    try {
        contactsData = await fetchData();
        if (contactsData && contactsData.length > 0) {
            contactsData = contactsData.filter(contact => contact && contact.fullName);
            contactsData.sort(function(a, b) {
                return a.fullName.localeCompare(b.fullName);
            });
            let groupedContacts = groupContacts(contactsData);
            renderContacts(groupedContacts);
            setupContactClickHandlers();
            setupEditDeleteButtons(); 
        } else {
            console.error('No valid contacts data found.');
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function setupContactClickHandlers() {
    let contacts = document.querySelectorAll('.single-contact');
    for (let i = 0; i < contacts.length; i++) {
        contacts[i].removeEventListener('click', handleContactClick);
        contacts[i].addEventListener('click', handleContactClick);
    }
}

function groupContacts(contacts) {
    return contacts.reduce(function(grouped, contact) {
        let firstLetter = contact.fullName[0].toUpperCase();
        if (!grouped[firstLetter]) {
            grouped[firstLetter] = [];
        }
        grouped[firstLetter].push(contact);
        return grouped;
    }, {});
}

function renderContacts(groupedContacts) {
    let contacts = document.getElementById('contactlist');
    contacts.innerHTML = '';
    for (let letter in groupedContacts) {
        contacts.innerHTML += `<h3 class="first-letter">${letter}</h3><div class="vector">`;
        for (let contact of groupedContacts[letter]) {
            let initials = getInitials(contact.fullName);
            let color = applyColor(contact);

            contacts.innerHTML += `
                <div class="single-contact" data-index="${contactsData.indexOf(contact)}">
                    <div class="contactIcon" style="background-color: ${color};">${initials}</div>
                    <div>
                        <h3 class="contact-list-name">${contact.fullName}</h3>
                        <a href="mailto:${contact.email}">${contact.email}</a>
                    </div>
                </div>
                <br>
            `;
        }
        contacts.innerHTML += `</div>`;
    }
}

function handleContactClick(event) {
    let index = event.currentTarget.getAttribute('data-index');
    showContactDetails(index);
}

function showContactDetails(index) {
    let contact = contactsData[index];
    let color = contact.color;
    let chosenContact = document.getElementById('chosenContacts');
    chosenContact.style.display = 'block';
    let contactIcon = chosenContact.querySelector('.contact-icon');
    let contactName = chosenContact.querySelector('.contact-name');
    let emailAddress = chosenContact.querySelector('.email-address');
    let phoneNumber = chosenContact.querySelector('.phone-number');
    contactIcon.innerText = getInitials(contact.fullName);
    contactIcon.style.backgroundColor = color;
    contactName.innerText = contact.fullName;
    emailAddress.innerText = contact.email;
    phoneNumber.innerText = contact.phone;
    currentContactIndex = index;
    setupEditDeleteButtons(); 
    highlightSelectedContact(index);
}

function setupEditDeleteButtons() {
    let editButton = document.querySelector('.contact-edit');
    let deleteButton = document.querySelector('.contact-delete');

    if (editButton && deleteButton) {
        editButton.style.display = 'block';  
        deleteButton.style.display = 'block';

        editButton.removeEventListener('click', setupEditContact);
        deleteButton.removeEventListener('click', handleDeleteContact);

        editButton.addEventListener('click', setupEditContact);
        deleteButton.addEventListener('click', handleDeleteContact);
    }
}

function highlightSelectedContact(index) {
    if (selectedContact !== null) {
        selectedContact.classList.remove('selected');
    }
    selectedContact = document.querySelectorAll('.single-contact')[index];
    selectedContact.classList.add('selected');
}

function showEditDeleteButtons() {
    let contactChangeElement = document.querySelector('.contact-change');
    if (contactChangeElement) {
        contactChangeElement.style.display = 'flex';  
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

    setTimeout(function() {
        messageContainer.remove();
    }, 3000);
}

function handleDeleteContact() {
    let contactId = contactsData[currentContactIndex].id;
    deleteContact(contactId);
}

async function deleteContact(contactId) {
    try {
        let response = await fetch(`${API_URL}1/users/${contactId}.json`, {
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

function setupEditContact() {
    let contact = contactsData[currentContactIndex];
    
    fetch('overlay.html')
        .then(response => response.text())
        .then(html => {
           let overlayContainer = document.getElementById('overlay-container');
            overlayContainer.innerHTML = html;

            let contactNameInput = document.getElementById('contactName');
            let contactEmailInput = document.getElementById('contactEmail');
            let contactPhoneInput = document.getElementById('contactPhone');
            let saveButton = document.getElementById('createContactButton');

            if (contactNameInput && contactEmailInput && contactPhoneInput) {
                contactNameInput.value = contact.fullName;
                contactEmailInput.value = contact.email;
                contactPhoneInput.value = contact.phone;
            }
            if (saveButton) {
                saveButton.innerText = "Save";
                saveButton.onclick = function () {
                    saveContact(contact.id);
                };
            }
           showOverlay();
        })
        .catch(error => {
            console.error('Error loading overlay:', error);
        });
}

async function saveContact(contactId) {
    let updatedContact = {
        fullName: document.getElementById('contactName').value,
        email: document.getElementById('contactEmail').value,
        phone: document.getElementById('contactPhone').value
    };

    try {
        let response = await fetch(`${API_URL}1/users/${contactId}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedContact)
        });
        if (!response.ok) {
            throw new Error('Failed to save contact');
        }
        await loadData();
        showContactDetails(currentContactIndex);
        showSuccessMessage('Contact successfully updated');
        closeOverlay();
    } catch (error) {
        console.error('Error saving contact:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    let editDeleteSettingButton = document.querySelector('.edit-delete-setting');
    let contactChangeElement = document.querySelector('.contact-change');
    
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

    setupContactClickHandlers();
    setupEditDeleteButtons(); 
    showEditDeleteButtons(); 
});

function init() {
    loadData().then(function() {
        setupContactClickHandlers();
        setupEditDeleteButtons(); 
        showEditDeleteButtons(); 
    });
}

document.addEventListener('DOMContentLoaded', function() {
    let button = document.getElementById('animateSettingBtn');
    let contactChangeDiv = document.querySelector('.contact-change');
    button.addEventListener('click', function(event) {
        event.preventDefault();
        contactChangeDiv.classList.add('move-left');
        contactChangeDiv.classList.remove('move-right');
        event.stopPropagation();
    });
    document.addEventListener('click', function(event) {
        if (!button.contains(event.target) && !contactChangeDiv.contains(event.target)) {
            contactChangeDiv.classList.add('move-right');
            contactChangeDiv.classList.remove('move-left');
        }
    });
});
