let targetSectionId = 'todo'; 
let contacts = [];
let assignedContacts = new Set(); // Verwende ein Set, um die zugewiesenen Kontakte zu verfolgen

// Funktion zum Abrufen der Kontakte aus der Datenbank
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
        updateAssignedContactsDisplay();
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

// Kontakte in den Container einfügen
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

// Entfernen eines zugewiesenen Kontakts
function removeAssignedContact(contactId) {
    assignedContacts.delete(contactId);
    updateAssignedContactsDisplay();
}

function updateAssignedContactsDisplay() {
    const assignedContactsContainer = document.getElementById('assignedContacts');
    assignedContactsContainer.innerHTML = '';

    contacts.forEach(contact => {
        if (assignedContacts.has(contact.id)) {
            const contactDiv = document.createElement('div');
            contactDiv.className = 'assigned-contact';
            contactDiv.textContent = getInitials(contact.fullName);
            contactDiv.dataset.id = contact.id;

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

// Holt die Initialen eines Kontakts
function getInitials(fullName) {
    const names = fullName.split(' ');
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
    return initials;
}

// Event-Listener für das Initialisieren der Seite und das Laden der Kontakte
document.addEventListener('DOMContentLoaded', function() {
    loadContactsFromDatabase();
});

async function createTask() {
    if (!validateForm()) {
        return;
    }

    if (contacts.length === 0) {
        await loadContactsFromDatabase();
    }

    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const assignedTo = Array.from(document.getElementById('assignedTo').selectedOptions).map(option => option.value);

    const priority = getActivePriority();
    const category = document.getElementById('category').value;
    const subtasks = {}; // Anstelle eines Arrays verwenden wir ein Objekt
    Array.from(document.querySelectorAll('#subtaskList .subtask-list-item')).forEach((item, index) => {
        subtasks[`item_${index}`] = { text: item.textContent };
    });

    const dueDate = document.getElementById('dueDate').value;
    const task = {
        title,
        description,
        assignedTo,
        priority,
        category,
        subtasks,
        dueDate,
        status: 'todo'  // Standardstatus für neue Aufgaben
    };

    try {
        const taskId = await saveTaskToDatabase(task);
        console.log('Task successfully created with ID:', taskId);
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

async function addSubtask() {
    let subtaskInput = document.getElementById('newSubtask');
    let subtaskList = document.getElementById('subtaskList');

    if (subtaskInput.value.trim() !== '') {
        let newSubtask = document.createElement('div');
        newSubtask.className = 'subtask-list-item';
        newSubtask.textContent = subtaskInput.value.trim();
        subtaskList.appendChild(newSubtask);
        subtaskInput.value = '';
        if (!document.querySelector('.subtask-list').previousElementSibling || !document.querySelector('.subtask-list').previousElementSibling.classList.contains('subtask-title')) {
            let subtasksHeader = document.createElement('div');
            subtasksHeader.className = 'subtask-title';
            subtaskList.parentElement.insertBefore(subtasksHeader, subtaskList);
        }
    }
}

// Buttons Colour
function setActivePriority(button) {
    const buttons = document.getElementsByClassName('priority-button');
    for (let i = 0; i < buttons.length; i++) {
        const img = buttons[i].querySelector('img');
        buttons[i].classList.remove('active-urgent', 'active-medium', 'active-low');
        buttons[i].style.backgroundColor = 'white';
        buttons[i].style.color = 'black';
        switch (buttons[i].id) {
            case 'urgent':
                img.src = './assets/icons/Board-icons/urgent-red.svg';
                break;
            case 'medium':
                img.src = './assets/icons/Board-icons/medium-orange.svg';
                break;
            case 'low':
                img.src = './assets/icons/Board-icons/low-green.svg';
                break;
        }
    }
    button.classList.add(`active-${button.id}`);
    const priorityColors = {
        urgent: '#FF3D00',
        medium: '#FFA800',
        low: '#7AE229'
    };
    button.style.backgroundColor = priorityColors[button.id];
    button.style.color = 'white';
    const activeImg = button.querySelector('img');
    switch (button.id) {
        case 'urgent':
            activeImg.src = './assets/icons/Board-icons/urgent-white.svg';
            break;
        case 'medium':
            activeImg.src = './assets/icons/Board-icons/medium-white.svg';
            break;
        case 'low':
            activeImg.src = './assets/icons/Board-icons/low-white.svg';
            break;
    }
}

function validateForm() {
    let isValid = true;
    document.querySelectorAll('.error-message').forEach(errorElement => {
        errorElement.textContent = '';
    });
    let title = document.getElementById('taskTitle').value;
    if (!title) {
        document.getElementById('taskTitleError').textContent = 'Title is required';
        isValid = false;
    }
    let dueDate = document.getElementById('dueDate').value;
    if (!dueDate || new Date(dueDate) == "Invalid Date") {
        document.getElementById('dueDateError').textContent = 'Due Date is required';
        isValid = false;
    }
    let category = document.getElementById('category').value;
    if (!category || category === 'Select task category') {
        document.getElementById('categoryError').textContent = 'Category is required';
        isValid = false;
    }
    return isValid;
}

// Event-Listener für Eingaben hinzufügen -> Fehlermeldungen zurücksetzen
function setupEventListeners() {
    document.getElementById('taskTitle').addEventListener('input', function() {
        document.getElementById('taskTitleError').textContent = '';
    });
    document.getElementById('dueDate').addEventListener('input', function() {
        document.getElementById('dueDateError').textContent = '';
    });
    document.getElementById('category').addEventListener('change', function() {
        document.getElementById('categoryError').textContent = '';
    });
}

function resetErrorMessages() {
    document.querySelectorAll('.error-message').forEach(errorElement => {
        errorElement.textContent = '';
    });
}

async function saveTaskToDatabase(task) {
    try {
        const rootKey = await getTaskRootKey();
        if (!rootKey) {
            throw new Error('Root key for tasks not found');
        }

        const taskId = await getNextId(rootKey);
        const response = await fetch(`${API_URL}/${rootKey}/tasks/${taskId}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        if (!response.ok) {
            throw new Error('Failed to save task to database');
        }
        console.log('Task saved to database with ID:', taskId);
        return taskId;
    } catch (error) {
        console.error('Error saving task to database:', error);
        throw error;
    }
}

async function loadTasksFromDatabase() {
    try {
        const rootKey = await getTasksRootKey();  // Korrigierter Funktionsname
        if (!rootKey) {
            throw new Error('Root key for tasks not found');
        }

        const response = await fetch(`${API_URL}/${rootKey}/tasks.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        Object.entries(data || {}).forEach(([id, task]) => {
            if (task) {
                const taskHTML = generateTaskHTML(
                    task.title || 'No title',
                    task.description || 'No description',
                    task.assignedTo || [],
                    task.priority || 'low',
                    task.category || 'uncategorized',
                    task.subtasks || [],
                    task.dueDate || '',
                    id
                );
                insertTaskIntoContainer(taskHTML, task.status || 'toDo');
            } else {
                console.warn(`Task with id ${id} is null or undefined`);
            }
        });
    } catch (error) {
        console.error('Error loading tasks from database:', error);
    }
}


async function getNextId(rootKey) {
    try {
        const response = await fetch(`${API_URL}/${rootKey}/tasks.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        let data = await response.json();
        if (!data) {
            return 1;
        }
        let ids = Object.keys(data).map(id => parseInt(id));
        let nextId = Math.max(...ids) + 1;
        
        return nextId;
    } catch (error) {
        console.error('Error getting next ID:', error);
        throw error;
    }
}

// Holt die aktive Priorität
function getActivePriority() {
    const priorityButton = document.querySelector('.priority-button.active');
    return priorityButton ? priorityButton.id : 'low';
}

// Holt alle Subtasks
function getSubtasks() {
    return Array.from(document.querySelectorAll('#subtaskList .subtask-list-item')).map(item => ({
        text: item.textContent,
    }));
}

// HTML für eine Aufgabe
function generateTaskHTML(title, description, assignedTo, priority, category, subtasks, dueDate) {
    const progressBarWidth = subtasks.length ? (subtasks.filter(subtask => subtask.completed).length / subtasks.length) * 100 : 0;
    const priorityImgSrc = getPriorityImageSrc(priority);
    const formattedDueDate = new Date(dueDate).toLocaleDateString('de-DE');
    return `
        <div class="task-card" id="${title.replace(/\s+/g, '-').toLowerCase()}">
            <div class="task-category">${category}</div>
            <div class="task-title">${title}</div>
            <div class="task-description">${description}</div>
            <div class="task-due-date">Due Date: ${formattedDueDate}</div> <!-- Show formatted date -->
            <div class="task-progress-container">
                <div class="task-progress-bar" style="width: ${progressBarWidth}%"></div>
                <div class="task-progress-text">${subtasks.length ? subtasks.filter(subtask => subtask.completed).length + '/' + subtasks.length + ' Subtasks' : 'No Subtasks'}</div>
            </div>
            <div class="task-footer">
                <div class="task-assigned-to">Assigned to: ${assignedTo.join(', ')}</div>
                <div class="task-priority">
                    <img src="${priorityImgSrc}" alt="${priority} Priority">
                </div>
                <button class="delete-task-button" onclick="deleteTask('${title.replace(/\s+/g, '-').toLowerCase()}')">Delete</button>
            </div>
        </div>
    `;
}

// Bildpfad -> Priorität
function getPriorityImageSrc(priority) {
    switch (priority) {
        case 'urgent':
            return '/assets/icons/Board-icons/urgent-red.svg';
        case 'medium':
            return '/assets/icons/Board-icons/medium-orange.svg';
        case 'low':
            return '/assets/icons/Board-icons/low-green.svg';
        default:
            return '/assets/icons/Board-icons/low-green.svg';
    }
}

// Fügt die Aufgabe in den Container ein
function insertTaskIntoContainer(taskHTML, status = 'toDo') {
    const container = document.getElementById(status);
    if (container) {
        container.insertAdjacentHTML('beforeend', taskHTML);
    } else {
        console.error(`Container ${status} not found`);
    }
}

// Funktion zum Löschen einer Aufgabe

async function deleteTask(taskId) {
    try {
        const rootKey = await getTasksRootKey();  // Korrigierter Funktionsname
        if (!rootKey) {
            throw new Error('Root key for tasks not found');
        }

        let response = await fetch(`${API_URL}/${rootKey}/tasks/${taskId}.json`, {
            method: 'DELETE'
        });
        if (response.ok) {
            const taskElement = document.getElementById(taskId);
            if (taskElement) {
                taskElement.remove();
            } else {
                console.error(`Task with ID ${taskId} not found in the UI.`);
            }
        } else {
            console.error('Failed to delete task from the database');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

function clearOverlay() {
    console.log('clearOverlay function called');

    // Leeren der Texteingabefelder
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('newSubtask').value = '';
    
    // Zurücksetzen der Dropdowns
    document.getElementById('assignedTo').selectedIndex = 0;
    document.getElementById('category').selectedIndex = 0;
    
    // Zurücksetzen des Datumseingabefeldes
    document.getElementById('dueDate').value = '';
    
    // Zurücksetzen der Prioritätsauswahl
    const priorityButtons = document.getElementsByClassName('priority-button');
    for (let button of priorityButtons) {
        button.classList.remove('active', 'active-urgent', 'active-medium', 'active-low');
        button.style.backgroundColor = 'white';
        button.style.color = 'black';
        const img = button.querySelector('img');
        switch (button.id) {
            case 'urgent':
                img.src = '/assets/icons/Board-icons/urgent-red.svg';
                break;
            case 'medium':
                img.src = '/assets/icons/Board-icons/medium-orange.svg';
                break;
            case 'low':
                img.src = '/assets/icons/Board-icons/low-green.svg';
                break;
        }
    }
    
    // Leeren der Subtasks-Liste
    const subtaskList = document.getElementById('subtaskList');
    subtaskList.innerHTML = '';
    const subtasksHeader = document.querySelector('.subtask-title');
    if (subtasksHeader) {
        subtasksHeader.remove();
    }
    
    // Fehlermeldungen zurücksetzen
    resetErrorMessages();
}
