
let API_URL = "https://join-d67a5-default-rtdb.europe-west1.firebasedatabase.app/";

async function loadData(){
    let response = await fetch(API_URL + ".json");
    if(response){
        let responseToJson = await response.json();
        let contacts = document.getElementById('contacts');
        contacts.innerHTML = '';

        for (let i = 0; i < responseToJson.length; i++) {
            let contact = responseToJson[i];
            document.getElementById('contacts').innerHTML += /*html*/ `
                <div>
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

function init(){
    loadData();
}