let API_URL = "https://join-d67a5-default-rtdb.europe-west1.firebasedatabase.app/";

const colors = [
    '#A8A8A8', '#D1D1D1', '#CDCDCD', '#007CEE', '#FF7A00', '#FF5EB3', 
    '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', 
    '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'
];

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

async function loadData(){
    try {
        let response = await fetch(API_URL + ".json");
        if(!response.ok) {
            throw new Error('Network response was not ok');
        }

        let responseToJson = await response.json();

        if (!Array.isArray(responseToJson)) {
            throw new Error('Response is not an array');
        }

        responseToJson.sort((a, b) => a.Name.localeCompare(b.Name));

         
         let groupedContacts = {};
         for (let contact of responseToJson) {
             let firstLetter = contact.Name[0].toUpperCase();
             if (!groupedContacts[firstLetter]) {
                 groupedContacts[firstLetter] = [];
             }
             groupedContacts[firstLetter].push(contact);
         }
 
         let contacts = document.getElementById('contacts');
         contacts.innerHTML = '';
 
         
         for (let letter in groupedContacts) {
             contacts.innerHTML += `<h3>${letter}</h2> 
                  <div class="vector"><div>                    
             `;
             for (let contact of groupedContacts[letter]) {
                let initials = contact.Name.split(' ').map(word => word[0]).join('').toUpperCase();
                let color = getRandomColor();

                contacts.innerHTML += /*html*/ `
                    <div class="single-contact">
                        <div class="contact-icon" style="background-color: ${color};">${initials}</div>
                        <div>
                            <h3>${contact.Name}</h3>
                            <a href="mailto:${contact.Email}">${contact.Email}</a>
                        </div>
                    </div>
                     <br>
                 `;
             }
         }
     } catch (error) {
         console.error('Error:', error);
     }
 }

function init(){
    loadData();
}