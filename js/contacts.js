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

function groupContacts(contacts) {
    return contacts.reduce((grouped, contact) => {
        let firstLetter = contact.Name[0].toUpperCase();
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
            let initials = getInitials(contact.Name);
            let color = getRandomColor();
            contactColors[contactsData.indexOf(contact)] = color;

            contacts.innerHTML += `
                <div class="single-contact" onclick="showContactDetails(${contactsData.indexOf(contact)})">
                    <div class="contactIcon" style="background-color: ${color};">${initials}</div>
                    <div>
                        <h3 class="contact-list-name">${contact.Name}</h3>
                        <a href="mailto:${contact.Email}">${contact.Email}</a>
                    </div>
                </div>
                <br>
            `;
        }
        contacts.innerHTML += `</div>`;
    }
}

async function loadData() {
    try {
        contactsData = await fetchData();
        if (contactsData && contactsData.length > 0) {
            contactsData = contactsData.filter(contact => contact && contact.Name);
            contactsData.sort((a, b) => a.Name.localeCompare(b.Name));
            let groupedContacts = groupContacts(contactsData);
            renderContacts(groupedContacts);
            document.querySelectorAll('.single-contact').forEach((contact, index) => {
                contact.addEventListener('click', () => showContactDetails(index));
            });
        } else {
            console.error('No valid contacts data found.');
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function showContactDetails(index) {
    let contact = contactsData[index];
    let color = contactColors[index];

    let chosenContact = document.getElementById('chosenContacts');
    chosenContact.style.display = 'block';

    let contactIcon = chosenContact.querySelector('.contact-icon');
    let contactName = chosenContact.querySelector('.contact-name');
    let emailAddress = chosenContact.querySelector('.email-address');
    let phoneNumber = chosenContact.querySelector('.phone-number');

    contactIcon.innerText = getInitials(contact.Name);
    contactIcon.style.backgroundColor = color;
    contactName.innerText = contact.Name;
    emailAddress.innerText = contact.Email;
    phoneNumber.innerText = contact.Phone;

    currentContactIndex = index;

    document.querySelector('.contact-edit').addEventListener('click', setupEditContact);
    document.querySelector('.contact-delete').addEventListener('click', () => deleteContact(contact.id));

    showEditDeleteButtons();
    highlightSelectedContact(index);
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

function getInitials(name) {
    let nameParts = name.split(' ');
    let initials = '';
    for (let i = 0; i < nameParts.length && initials.length < 2; i++) {
        initials += nameParts[i].charAt(0).toUpperCase();
    }
    return initials;
}

async function setupEditContact() {
    const contact = contactsData[currentContactIndex];
    const overlayHTML = await fetch('overlay.html').then(response => response.text());

    const overlayContainer = document.getElementById('overlay-container');
    overlayContainer.innerHTML = overlayHTML;
    showOverlay();

    const overlayTitle = document.querySelector('.text-bold');
    overlayTitle.innerText = 'Edit Contact';

    const overlaySubtitle = document.querySelector('.text-normal');
    overlaySubtitle.style.display = 'none';

    document.getElementById('contactName').value = contact.Name;
    document.getElementById('contactEmail').value = contact.Email;
    document.getElementById('contactPhone').value = contact.Phone;

    setEditCancelButton();
    setSaveContactButton(contact.id);

    // document.querySelector('.contact-change').style.display = 'none';

    const cancelButton = document.getElementById('cancelButton');
    cancelButton.addEventListener('click', closeEditContact);
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
    const updatedContact = {
        Name: document.getElementById('contactName').value,
        Email: document.getElementById('contactEmail').value,
        Phone: document.getElementById('contactPhone').value
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
        const sanitizedContact = {
            Name: contact.Name || '',
            Email: contact.Email || '',
            Phone: contact.Phone || ''
        };
        let response = await fetch(`${API_URL}/${contactId}.json`, {
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
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function deleteContact(contactId) {
    try {
        await fetch(`${API_URL}/${contactId}.json`, {
            method: 'DELETE'
        });
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
