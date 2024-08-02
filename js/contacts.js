let API_URL = "https://join-d67a5-default-rtdb.europe-west1.firebasedatabase.app/";
let contactsData = [];
let contactColors = {};

const colors = [
    '#A8A8A8', '#D1D1D1', '#CDCDCD', '#007CEE', '#FF7A00', '#FF5EB3', 
    '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', 
    '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'
];

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

async function fetchData() {
    let response = await fetch(API_URL + ".json");
    if (!response.ok) {
        throw new Error('Error');
    }
    let data = await response.json();
    if (!Array.isArray(data)) {
        throw new Error('Error');
    }
    return data;
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

            contacts.innerHTML += /*html*/ `
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
        } else {
            console.error('No valid contacts data found.');
        }
    } catch (error) {
        console.error('Error:', error);
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

}

function getInitials(name) {
    let nameParts = name.split(' ');
    let initials = '';
    for (let i = 0; i < nameParts.length; i++) {
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

    document.getElementById('contactName').value = contact.Name;
    document.getElementById('contactEmail').value = contact.Email;
    document.getElementById('contactPhone').value = contact.Phone;

    setupCloseButton();
    setupBackgroundClick();
    setupCancelButton();

    async function updateContact() {
        const updatedContact = {
            Name: document.getElementById('contactName').value,
            Email: document.getElementById('contactEmail').value,
            Phone: document.getElementById('contactPhone').value
        };

        try {
            await updateContactInAPI(contact.id, updatedContact);
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    }

    const updateContactButton = document.getElementById('createContactButton');
    updateContactButton.innerText = 'Update contact';
    updateContactButton.addEventListener('click', updateContact);
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
        closeOverlay();
    } catch (error) {
        console.error('Error updating contact:', error);
    }
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

function init() {
    loadData();
}
