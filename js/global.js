let API_URL = "https://join-d67a5-default-rtdb.europe-west1.firebasedatabase.app";
let todos = []; // Array zum Speichern der Aufgaben
let contacts = [];
let assignedContacts = new Set();

const colors = [
    '#A8A8A8', '#D1D1D1', '#CDCDCD', '#007CEE', '#FF7A00', '#FF5EB3',
    '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E',
    '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'
];

document.addEventListener('DOMContentLoaded', () => {
    if (typeof init === 'function') {
        init();  // Aufruf der Init-Funktion
    }

    if (typeof includeHTML === 'function') {
        includeHTML();  // Einfügen der HTML-Komponenten
    }

    if (typeof loadTasksFromDatabase === 'function') {
        loadTasksFromDatabase();  // Laden der Aufgaben
    }
});

// Funktion zum Konvertieren von Arrays in Objekte
function convertArrayToObject(array) {
    const obj = {};
    array.forEach((item, index) => {
        obj[`item_${index}`] = item;
    });
    return obj;
}

// Funktion zur Bereinigung der Datenbank
// async function cleanUpDatabase() {
//     try {
//         const response = await fetch(`${API_URL}/2/tasks.json`);
//         if (!response.ok) {
//             throw new Error('Failed to fetch tasks from Firebase');
//         }

//         const tasks = await response.json();
//         const cleanedTasks = {};

//         Object.keys(tasks).forEach(taskId => {
//             const task = tasks[taskId];
//             if (task && task.title) {
//                 if (task.dueDate === 'Invalid Date') {
//                     task.dueDate = null;
//                 }

//                 if (Array.isArray(task.subtasks)) {
//                     task.subtasks = convertArrayToObject(task.subtasks);
//                 }
//                 if (Array.isArray(task.assignedTo)) {
//                     task.assignedTo = convertArrayToObject(task.assignedTo);
//                 }

//                 cleanedTasks[taskId] = task;
//             } else {
//                 console.warn(`Task with id ${taskId} is invalid or undefined, skipping.`);
//             }
//         });

//         const putResponse = await fetch(`${API_URL}/2/tasks.json`, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(cleanedTasks)
//         });

//         if (!putResponse.ok) {
//             throw new Error('Failed to update tasks in Firebase');
//         }

//         console.log('Database cleaned up successfully');
//     } catch (error) {
//         console.error('Error during database cleanup:', error);
//     }
// }

// Funktion zum Abrufen des Root-Schlüssels
async function getRootKey(endpoint) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}.json`);
        const data = await response.json();
        const keys = Object.keys(data);

        if (keys.length > 0 && (keys[0] === "1" || keys[0] === "null")) {
            return keys[0];
        }

        return keys.length > 0 ? keys[0] : null;
    } catch (error) {
        console.error('Error fetching root key:', error);
        return null;
    }
}

// Funktion zum Abrufen des Root-Schlüssels für Benutzer
async function getUserRootKey() {
    try {
        const response = await fetch(`${API_URL}/.json`);
        const data = await response.json();
        const rootKey = Object.keys(data).find(key => data[key]?.users);

        // Debugging: Loggen des ermittelten Root-Schlüssels
        console.log('Determined root key for users:', rootKey);

        return rootKey;
    } catch (error) {
        console.error('Error fetching root key:', error);
        return null;
    }
}

async function getTaskRootKey() {
    try {
        const response = await fetch(`${API_URL}/.json`);
        const data = await response.json();
        const rootKey = Object.keys(data).find(key => data[key]?.tasks);

        // Debugging: Loggen des ermittelten Root-Schlüssels
        console.log('Determined root key for tasks:', rootKey);

        return rootKey;
    } catch (error) {
        console.error('Error fetching root key:', error);
        return null;
    }
}

// Funktion zum Abrufen des Root-Schlüssels für Aufgaben
async function getTasksRootKey() {
    try {
        const response = await fetch(`${API_URL}/.json`);
        const data = await response.json();
        const rootKey = Object.keys(data).find(key => data[key]?.tasks);

        // Debugging: Loggen des ermittelten Root-Schlüssels
        console.log('Determined root key for tasks:', rootKey);

        return rootKey;
    } catch (error) {
        console.error('Error fetching root key:', error);
        return null;
    }
}

// Funktion zum Abrufen der nächsten ID für die Aufgaben (beibehalten)
async function getNextId(rootKey) {
    try {
        const response = await fetch(`${API_URL}/${rootKey}/tasks.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        let data = await response.json();

        if (!data) {
            return 1;  // Wenn keine Aufgaben vorhanden sind, beginne mit der ID 1
        }

        // Überprüfen, ob die IDs wirklich numerisch sind und extrahiere die Zahl nach 'task_'
        let ids = Object.keys(data)
            .map(id => {
                const numericId = parseInt(id.replace('task_', ''));  // Entferne 'task_' und konvertiere in eine Zahl
                return isNaN(numericId) ? 0 : numericId;  // Filtere ungültige IDs heraus, setze sie auf 0
            });

        let nextId = Math.max(...ids) + 1;  // Die nächste ID ist das Maximum plus eins
        
        return nextId;
    } catch (error) {
        console.error('Error getting next ID:', error);
        throw error;
    }
}

async function cleanUpTasksInDatabase() {
    try {
        const rootKey = await getTaskRootKey();  // Root-Schlüssel für Tasks abrufen
        if (!rootKey) {
            throw new Error('Root key for tasks not found');
        }

        const response = await fetch(`${API_URL}/${rootKey}/tasks.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks from database');
        }
        const tasks = await response.json();

        const cleanedTasks = {};

        Object.entries(tasks || {}).forEach(([id, task]) => {
            // Sicherstellen, dass notwendige Felder vorhanden sind
            const cleanedTask = {
                id: id,
                title: task.title || 'No Title',
                description: task.description || '',
                assignedTo: task.assignedTo || {},
                category: task.category || 'Uncategorized',
                dueDate: task.dueDate || '',
                priority: task.priority || 'low',
                status: task.status || 'todo',
                subtasks: task.subtasks || {},
                progress: task.progress !== undefined ? task.progress : 0,
            };

            cleanedTasks[id] = cleanedTask;
        });

        // Aktualisiere die bereinigten Tasks in der Datenbank
        const updateResponse = await fetch(`${API_URL}/${rootKey}/tasks.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanedTasks)
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update tasks in the database');
        }

        console.log('Tasks cleaned up successfully in the database');
    } catch (error) {
        console.error('Error cleaning up tasks in database:', error);
    }
}

// Funktion zum Abrufen der Kontakte aus der Datenbank (global verwendbar)
async function loadContactsFromDatabase() {
    try {
        const rootKey = await getUserRootKey();
        if (!rootKey) {
            throw new Error('Root key for users not found');
        }

        const response = await fetch(`${API_URL}/${rootKey}/users.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch contacts');
        }

        const data = await response.json();
        contacts = Object.entries(data || {}).map(([id, contact]) => ({
            id,
            ...contact
        }));

        populateContactsContainer();
        updateAssignedContactsDisplay();  // Sicherstellen, dass diese Funktion aufgerufen wird
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

// Funktion zum Speichern einer Aufgabe in der Datenbank
async function saveTaskToDatabase(task) {
    try {
        const rootKey = await getTaskRootKey();
        if (!rootKey) {
            throw new Error('Root key for tasks not found');
        }

        const taskId = await getNextId(rootKey);
        const taskKey = `task_${taskId}`;  // Erstellen des Schlüssels für die Aufgabe
        const response = await fetch(`${API_URL}/${rootKey}/tasks/${taskKey}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error('Failed to save task to database');
        }

        console.log('Task saved to database with ID:', taskKey);
        return taskId;
    } catch (error) {
        console.error('Error saving task to database:', error);
        throw error;
    }
}

// Generelle Helper Funktionen, z.B. für die Initialen eines Kontakts
function getInitials(fullName) {
    const names = fullName.split(' ');
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
    return initials;
}

// Funktion, um Kontakte in den Container einzufügen
function populateContactsContainer() {
    const contactsContainer = document.getElementById('contactsContainer');
    contactsContainer.innerHTML = '';

    contacts.forEach(contact => {
        const contactDiv = document.createElement('div');
        contactDiv.className = 'contact-item';
        contactDiv.dataset.id = contact.id;
        contactDiv.textContent = contact.fullName;

        contactDiv.addEventListener('click', () => {
            toggleContactSelection(contact.id);
        });

        contactsContainer.appendChild(contactDiv);
    });
}

// Anzeige der zugewiesenen Kontakte aktualisieren
function updateAssignedContactsDisplay() {
    const assignedContactsContainer = document.getElementById('assignedContacts');
    assignedContactsContainer.innerHTML = '';

    contacts.forEach(contact => {
        if (assignedContacts.has(contact.id)) {
            const contactDiv = document.createElement('div');
            contactDiv.className = 'assigned-contact';
            contactDiv.textContent = getInitials(contact.fullName);
            contactDiv.dataset.id = contact.id;
            contactDiv.style.backgroundColor = contact.color || '#007bff';  // Kontaktfarbe setzen oder Standardfarbe (Blau)

            contactDiv.addEventListener('click', () => {
                removeAssignedContact(contact.id);
                const contactDivInContainer = document.querySelector(`.contact-item[data-id="${contact.id}"]`);
                if (contactDivInContainer) {
                    contactDivInContainer.classList.remove('selected');
                }
            });

            assignedContactsContainer.appendChild(contactDiv);
        }
    });
}

// Toggle der Auswahl eines Kontakts
function toggleContactSelection(contactId) {
    const contactDiv = document.querySelector(`.contact-item[data-id="${contactId}"]`);
    const isSelected = contactDiv.classList.contains('selected');

    if (isSelected) {
        contactDiv.classList.remove('selected');
        removeAssignedContact(contactId);
    } else {
        contactDiv.classList.add('selected');
        addAssignedContact(contactId);
    }
}

// Hinzufügen eines zugewiesenen Kontakts zur Anzeige
function addAssignedContact(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
        assignedContacts.add(contactId);
        updateAssignedContactsDisplay();
    }
}

// Funktion zur Anzeige einer Erfolgsmeldung
function showSuccessMessage(message = 'Task successfully created!') {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = message;
    document.body.appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
    }, 3000);  // Entfernt die Meldung nach 3 Sekunden
}

// Funktion zur Einschränkung der Datumsauswahl
function restrictDateSelection() {
    const dueDateInput = document.getElementById('dueDate');
    const today = new Date().toISOString().split('T')[0];  // Aktuelles Datum im Format YYYY-MM-DD
    dueDateInput.setAttribute('min', today);  // Setzt das Mindestdatum auf das heutige Datum
}



// Entfernen eines zugewiesenen Kontakts
function removeAssignedContact(contactId) {
    assignedContacts.delete(contactId);
    updateAssignedContactsDisplay();
}
