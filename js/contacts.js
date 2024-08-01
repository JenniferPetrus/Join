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
        contacts.innerHTML += `<h3>${letter}</h3><div class="vector">`;
        for (let contact of groupedContacts[letter]) {
            let initials = getInitials(contact.Name);
            let color = getRandomColor();
            contactColors[contactsData.indexOf(contact)] = color;

            contacts.innerHTML += /*html*/ `
                <div class="single-contact" onclick="showContactDetails(${contactsData.indexOf(contact)})">
                    <div class="contact-icon" style="background-color: ${color};">${initials}</div>
                    <div>
                        <h3>${contact.Name}</h3>
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
        contactsData.sort((a, b) => a.Name.localeCompare(b.Name));
        let groupedContacts = groupContacts(contactsData);
        renderContacts(groupedContacts);
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
}

function getInitials(name) {
    let nameParts = name.split(' ');
    let initials = '';
    for (let i = 0; i < nameParts.length; i++) {
        initials += nameParts[i].charAt(0).toUpperCase();
    }
    return initials;
}

function init() {
    loadData();
}
