let API_URL = "https://join-d67a5-default-rtdb.europe-west1.firebasedatabase.app/";
let contactsData = [];

async function loadData() {
    let response = await fetch(API_URL + ".json");
    if (response) {
        contactsData = await response.json();
        let contacts = document.getElementById('contacts');
        contacts.innerHTML = '';

        for (let i = 0; i < contactsData.length; i++) {
            let contact = contactsData[i];
            contacts.innerHTML += /*html*/ `
                <div class="contact-item" onclick="showContactDetails(${i})">
                    <h2>${contact.Name}</h2>
                    <p>Email <br>${contact.Email}</p>
                    <p>Phone <br>${contact.Phone}</p>
                </div>
            `;
        }
    } else {
        console.error('Error');
    }
}

function showContactDetails(index) {
    let contact = contactsData[index];

    document.querySelector('.chosen-contact').style.display = 'block';

    let contactName = document.getElementsByClassName('contact-name')[0];
    contactName.innerText = contact.Name;

    let emailAddress = document.getElementsByClassName('email-address')[0];
    emailAddress.innerText = contact.Email;

    let phoneNumber = document.getElementsByClassName('phone-number')[0];
    phoneNumber.innerText = contact.Phone;

    let initials = getInitials(contact.Name);
    let contactIcon = document.getElementsByClassName('contact-icon')[0];
    contactIcon.innerText = initials;
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
