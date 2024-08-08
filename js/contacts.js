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
                result.push({ id: key, ...data[1].users[key] });
            }
        }
        console.log("Fetched contacts data:", result);
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
            contactsData.sort((a, b) => a.fullName.localeCompare(b.fullName));
            console.log("Loaded contacts data:", contactsData);
            let groupedContacts = groupContacts(contactsData);
            renderContacts(groupedContacts);
            document.querySelectorAll('.single-contact').forEach((contact, index) => {
                contact.removeEventListener('click', handleContactClick);
                contact.addEventListener('click', handleContactClick);
            });
        } else {
            console.error('No valid contacts data found.');
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

async function addContact(contact) {
    try {
        let nextId = await getNextId();
        let userId = `user${nextId}`;
        let response = await fetch(`${API_URL}1/users/${userId}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contact)
        });
        if (!response.ok) {
            throw new Error('Failed to add contact');
        }
        console.log(`Added contact with ID: ${userId}`, contact);
        await loadData();
    } catch (error) {
        console.error('Error adding contact:', error);
    }
}

async function updateContact(contactId, contact) {
    try {
        let response = await fetch(`${API_URL}1/users/${contactId}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contact)
        });
        if (!response.ok) {
            throw new Error('Failed to update contact');
        }
        console.log(`Updated contact with ID: ${contactId}`, contact);
        await loadData();
    } catch (error) {
        console.error('Error updating contact:', error);
    }
}

async function deleteContact(contactId) {
    try {
        console.log(`Attempting to delete contact with ID: ${contactId}`);
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

function groupContacts(contacts) {
    return contacts.reduce((grouped, contact) => {
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
            let color = getRandomColor();
            contactColors[contactsData.indexOf(contact)] = color;

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
    let color = contactColors[index];
    console.log(`Showing details for contact with index: ${index}`, contact);

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

    document.querySelector('.contact-edit').removeEventListener('click', setupEditContact);
    document.querySelector('.contact-delete').removeEventListener('click', handleDeleteContact);

    document.querySelector('.contact-edit').addEventListener('click', setupEditContact);
    document.querySelector('.contact-delete').addEventListener('click', handleDeleteContact);
    
    showEditDeleteButtons();
    highlightSelectedContact(index);
}

function handleDeleteContact() {
    let contactId = contactsData[currentContactIndex].id;
    deleteContact(contactId);
}

function getInitials(name) {
    let nameParts = name.split(' ');
    let initials = '';
    for (let i = 0; i < nameParts.length && initials.length < 2; i++) {
        initials += nameParts[i].charAt(0).toUpperCase();
    }
    return initials;
}

function highlightSelectedContact(index) {
    if (selectedContact !== null) {
        selectedContact.classList.remove('selected');
    }
    selectedContact = document.querySelectorAll('.single-contact')[index];
    selectedContact.classList.add('selected');
}

function showEditDeleteButtons() {
    const contactChangeElement = document.querySelector('.contact-change');
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

    setTimeout(() => {
        messageContainer.remove();
    }, 3000);
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
        contact.removeEventListener('click', handleContactClick);
        contact.addEventListener('click', handleContactClick);
    });
});

function init() {
    loadData().then(() => {
        document.querySelectorAll('.single-contact').forEach((contact, index) => {
            contact.removeEventListener('click', handleContactClick);
            contact.addEventListener('click', handleContactClick);
        });
    });
}
// SettingButton
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('animateSettingBtn');
    const contactChangeDiv = document.querySelector('.contact-change');
    button.addEventListener('click', (event) => {
        event.preventDefault();
        contactChangeDiv.classList.add('move-left');
        contactChangeDiv.classList.remove('move-right');
        event.stopPropagation();
    });
    document.addEventListener('click', (event) => {
        if (!button.contains(event.target) && !contactChangeDiv.contains(event.target)) {
            contactChangeDiv.classList.add('move-right');
            contactChangeDiv.classList.remove('move-left');
        }
    });
});