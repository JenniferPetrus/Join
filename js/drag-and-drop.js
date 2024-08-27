// let contacts = [];
// let assignedContacts = new Set();

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
    
    if (!contactsContainer) {
        console.error('Element with ID "contactsContainer" not found.');
        return;
    }

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
    assignedContacts.add(contactId);
    updateAssignedContactsDisplay();
}

// Entfernen eines zugewiesenen Kontakts
function removeAssignedContact(contactId) {
    assignedContacts.delete(contactId);
    updateAssignedContactsDisplay();
}

function updateAssignedContactsDisplay() {
    const assignedContactsContainer = document.getElementById('assignedContacts');

    if (!assignedContactsContainer) {
        console.error('Element with ID "assignedContacts" not found.');
        return;
    }

    assignedContactsContainer.innerHTML = '';

    contacts.forEach(contact => {
        if (assignedContacts.has(contact.id)) {
            const contactDiv = document.createElement('div');
            contactDiv.className = 'assigned-contact';
            contactDiv.textContent = contact.fullName; // Zeigt den vollständigen Namen an
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
let taskCreationInProgress = false; // verhindert das erstellen von zwei Tasks

async function createTask() {
    if (taskCreationInProgress) {
        return;
    }

    taskCreationInProgress = true; 

    try {
        console.log('createTask function called');

        if (!validateForm()) {
            console.log('Form validation failed');
            taskCreationInProgress = false;
            return;
        }

        if (contacts.length === 0) {
            await loadContactsFromDatabase();
        }

        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const assignedTo = Array.from(document.querySelectorAll('#assignedContacts .assigned-contact')).map(contact => contact.dataset.id);

        const priority = getActivePriority();
        const category = document.getElementById('category').value;
        const subtasks = {};
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
            status: 'todo'
        };

        console.log('Saving task to database');
        const taskId = await saveTaskToDatabase(task);
        console.log('Task successfully created with ID:', taskId);
    } catch (error) {
        console.error('Error creating task:', error);
    } finally {
        taskCreationInProgress = false;
    }
}
// Funktion zum Abrufen der aktiven Priorität
function getActivePriority() {
    const priorityButton = document.querySelector('.priority-button.active');
    return priorityButton ? priorityButton.id : 'low';
}

document.addEventListener('DOMContentLoaded', function() {
    const createTaskButton = document.getElementById('createTaskButton');  // Hier die richtige Button-ID verwenden
    if (createTaskButton) {
        createTaskButton.removeEventListener('click', createTask);  // Entfernt vorherige Event-Listener
        createTaskButton.addEventListener('click', createTask);     // Fügt den Event-Listener einmal hinzu
    }
});


// Initialisiere Drag-and-Drop
function initDragAndDrop() {
    let draggedElement = null;

    document.querySelectorAll('.todo').forEach(task => {
        task.addEventListener('dragstart', (e) => {
            startDragging(e, task.id);  // startDragging Funktion aufrufen
        });

        task.addEventListener('dragend', (e) => {
            e.target.style.opacity = 1;
            draggedElement = null;
        });
    });

    document.querySelectorAll('.drag-area-responsive').forEach(container => {
        container.addEventListener('dragover', (e) => {
            allowDrop(e);  // allowDrop Funktion aufrufen
        });

        container.addEventListener('dragleave', (e) => {
            removeHighlight(container.id);  // removeHighlight Funktion aufrufen
        });

        container.addEventListener('drop', async (e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('text/plain');
            const taskElement = document.getElementById(taskId);

            if (!taskId) {
                console.error('Task ID is missing or invalid.');
                return;
            }
            if (!taskElement) {
                console.error(`Task element with ID ${taskId} not found.`);
                return;
            }
            if (!container) {
                console.error(`Target container with ID ${container.id} not found.`);
                return;
            }

            // Überprüfen, ob das Element bereits im Zielcontainer vorhanden ist
            if (container.contains(taskElement)) {
                console.warn('Task is already in the target container.');
                return;
            }

             
            container.appendChild(taskElement);
            const newStatus = container.id;
 
            const baseTaskId = taskId.split('-')[0]; 
            taskElement.id = `${baseTaskId}-${newStatus}`; 
            console.log(`Updated task ID to: ${taskElement.id}`);

            await updateTaskStatusInDatabase(baseTaskId.split('_')[1], newStatus); 
            hidePlaceholders();
        });
    });
}

// Funktion zum Starten des Drag-Vorgangs
function startDragging(event, taskId) {
    event.dataTransfer.setData('text/plain', taskId);
    event.target.style.opacity = 0.5;
    console.log('Dragging started for task with ID:', taskId);
}

function allowDrop(event) {
    event.preventDefault();
}

function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

async function updateTaskStatusInDatabase(taskId, newStatus) {
    try {
        const rootKey = await getTaskRootKey();
        if (!rootKey) {
            throw new Error('Root key for tasks not found');
        }

        const response = await fetch(`${API_URL}/${rootKey}/tasks/${taskId}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Failed to update task status');
        }

        console.log(`Task ${taskId} updated to ${newStatus}`);
    } catch (error) {
        console.error('Error updating task status:', error);
    }
}

// Verstecke Platzhalter, wenn Aufgaben vorhanden sind
function hidePlaceholders() {
    document.querySelectorAll('.drag-area-responsive').forEach(container => {
        const hasTasks = container.querySelectorAll('.todo').length > 0;
        const placeholder = container.querySelector('.placeholder-text');
        if (placeholder) {
            placeholder.style.display = hasTasks ? 'none' : 'block';
        }
    });
}

// Tasks aus der Datenbank laden und anzeigen
async function loadTasksFromDatabase() {
    try {
        const rootKey = await getTaskRootKey();
        if (!rootKey) {
            throw new Error('Root key for tasks not found');
        }

        const response = await fetch(`${API_URL}/${rootKey}/tasks.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        console.log("Loaded tasks:", data);

        Object.entries(data || {}).forEach(([id, task]) => {
            if (!task || !task.title) {
                console.warn(`Task with id ${id} is null or undefined`);
                return;
            }

            const status = task.status || 'todo';

            const existingTaskElement = document.getElementById(`task_${id}`);
            if (!existingTaskElement) {
                const taskHTML = generateTaskHTML({
                    id: id,
                    title: task.title,
                    description: task.description,
                    assignedTo: task.assignedTo || {},
                    priority: task.priority,
                    category: task.category,
                    subtasks: task.subtasks || {}
                });
                insertTaskIntoContainer(taskHTML, status);
            } else {
                console.warn(`Task with ID ${id} already exists in the DOM.`);
            }
        });

        initDragAndDrop();

    } catch (error) {
        console.error('Error loading tasks from database:', error);
    }
}


// HTML für eine Aufgabe generieren
function generateTaskHTML(task) {
    const { id, title, description, assignedTo, priority, category, subtasks = {} } = task;

    // Debug-Ausgabe für die Priorität
    console.log('Task Priority:', priority);

    // Standardmäßige Hintergrundfarbe für die Kategorie
    let categoryBackgroundColor = '';
    switch (category) {
        case 'User Story':
            categoryBackgroundColor = '#0038FF';
            break;
        case 'Technical Task':
            categoryBackgroundColor = '#1FD7C1';
            break;
        default:
            categoryBackgroundColor = '#CCCCCC'; // Default-Farbe für andere Kategorien
    }

    // Berechnung des Fortschritts
    const subtasksArray = Object.values(subtasks);
    const completedSubtasks = subtasksArray.filter(subtask => subtask.completed).length;
    const totalSubtasks = subtasksArray.length;
    const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    // Fortschrittsanzeige HTML
    let progressBarHTML = '';
    if (totalSubtasks > 0) {
        let progressBarColor = progress > 0 ? '#1E90FF' : '#D3D3D3';
        progressBarHTML = `
            <div class="task-progress">
                <div class="progress-bar" style="background-color: ${progressBarColor}; width: ${progress}%;"></div>
                <div class="progress-info">${completedSubtasks}/${totalSubtasks} Subtasks</div>
            </div>`;
    }

    // Prioritätsbild URL
    let priorityImageURL = '';
    switch (priority) {
        case 'urgent':
            priorityImageURL = './assets/icons/Board-icons/urgent-red.svg';
            break;
        case 'medium':
            priorityImageURL = './assets/icons/Board-icons/medium-orange.svg';
            break;
        case 'low':
            priorityImageURL = './assets/icons/Board-icons/low-green.svg';
            break;
        default:
            priorityImageURL = './assets/icons/Board-icons/low-green.svg'; // Standardbild für unbekannte Prioritäten
    }

    // Debug-Ausgabe für die Bild-URL
    console.log('Priority Image URL:', priorityImageURL);

    // HTML für zugewiesene Kontakte
    let assignedContactsHTML = '';
    if (assignedTo) {
        Object.keys(assignedTo).forEach(contactId => {
            assignedContactsHTML += `<div class="contact-circle" title="${assignedTo[contactId]}">
                ${getInitials(assignedTo[contactId])}
            </div>`;
        });
    }

    return `
        <div draggable="true" class="todo" id="task_${id}">
            <div class="task-category" style="background-color: ${categoryBackgroundColor};">
                ${category || 'Uncategorized'}
            </div>
            <div class="task-title">${title || 'No Title'}</div>
            ${description ? `<div class="task-description">${description}</div>` : ''}
            ${progressBarHTML}
            <div class="task-footer">
                <div class="task-contacts">
                    ${assignedContactsHTML}
                </div>
                <div class="task-priority">
                    <img src="${priorityImageURL}" alt="${priority || 'low'} Priority" />
                </div>
            </div>
        </div>`;
}


// Fügt den Task in den entsprechenden Container ein
function insertTaskIntoContainer(taskHTML, status) {
    const container = document.getElementById(status);
    if (!container) {
        console.error(`Container with ID '${status}' not found.`);
        return;
    }
    container.insertAdjacentHTML('beforeend', taskHTML);
    console.log(`Inserted task into container with ID: ${status}`); 
}

// Initialisierung
document.addEventListener('DOMContentLoaded', async () => {
    await loadTasksFromDatabase(); // Tasks laden und Drag-and-Drop initialisieren
    hidePlaceholders();
    setupMutationObserver();
});

function closeOverlay() {
    document.getElementById('addTaskOverlay').style.display = 'none';
}
// FORMVALIDATION
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
    if (!dueDate) {
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

function resetErrorMessages() {
    document.querySelectorAll('.error-message').forEach(errorElement => {
        errorElement.textContent = '';
    });
}

// Farben der Prioritäten und ausgewählte Prio in der Task übergeben
function setActivePriority(button) {
    const buttons = document.getElementsByClassName('priority-button');
    for (let i = 0; i < buttons.length; i++) {
        const img = buttons[i].querySelector('img');
        buttons[i].classList.remove('active', 'active-urgent', 'active-medium', 'active-low');
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

    button.classList.add('active');
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
// Berechnet den Fortschritt
function calculateProgress(subtasks) {
    const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
    const totalSubtasks = subtasks.length;
    return totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
}
// Unteraufgaben
function addSubtask() {
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

        // Aktualisiere die Anzahl der Unteraufgaben in der bestehenden Aufgabe
        const taskId = document.getElementById('taskId').value; // Stellen Sie sicher, dass taskId gesetzt ist
        updateTaskInDatabase(taskId);
    }
}
async function updateTaskInDatabase(taskId) {
    try {
        const rootKey = await getTaskRootKey();
        if (!rootKey) {
            throw new Error('Root key for tasks not found');
        }

        // Abrufen der aktuellen Aufgabeninformationen
        const response = await fetch(`${API_URL}/${rootKey}/tasks/${taskId}.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch task details');
        }
        const task = await response.json();

        // Erstellen der Unteraufgabenliste
        const subtasksArray = Array.from(document.querySelectorAll('#subtaskList .subtask-list-item')).map(item => ({
            text: item.textContent,
            completed: false
        }));

        // Aktualisieren der Aufgabe in der Datenbank
        task.subtasks = subtasksArray;
        const updateResponse = await fetch(`${API_URL}/${rootKey}/tasks/${taskId}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subtasks: task.subtasks })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update task');
        }

        console.log('Task updated successfully with new subtasks');
        // Optional: Hier könnten Sie die Seite neu laden, um die Änderungen anzuzeigen
        loadTasksFromDatabase();
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

async function saveTaskToDatabase(task) {
    try {
        const rootKey = await getTaskRootKey();
        if (!rootKey) {
            throw new Error('Root key for tasks not found');
        }

        const response = await fetch(`${API_URL}/${rootKey}/tasks.json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });

        if (!response.ok) {
            throw new Error('Failed to save task');
        }

        console.log('Task created successfully');
        closeOverlay(); // Schließe das Overlay nach erfolgreichem Erstellen
        await loadTasksFromDatabase(); // Lade die Aufgaben neu
    } catch (error) {
        console.error('Error saving task:', error);
    }
}
