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
async function createTask() {
    if (!validateForm()) {
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
document.addEventListener('DOMContentLoaded', function() {
    loadContactsFromDatabase();
    // Andere Initialisierungen...
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

            // Task-Element in den neuen Container verschieben
            container.appendChild(taskElement);
            const newStatus = container.id;

            // Entferne das alte Suffix (z.B. .todo) und füge den neuen Status hinzu
            const baseTaskId = taskId.split('-')[0];  // Die Basis-ID ohne den alten Status
            taskElement.id = `${baseTaskId}-${newStatus}`;  // Neue ID basierend auf dem neuen Status
            console.log(`Updated task ID to: ${taskElement.id}`);

            await updateTaskStatusInDatabase(baseTaskId.split('_')[1], newStatus); // Status in der Datenbank aktualisieren
            hidePlaceholders(); // Aktualisiere Platzhalter
        });
    });
}

// Funktion zum Starten des Drag-Vorgangs
function startDragging(event, taskId) {
    event.dataTransfer.setData('text/plain', taskId);
    event.target.style.opacity = 0.5;
    console.log('Dragging started for task with ID:', taskId);
}

// Funktion, die das Ziehen über einem Container erlaubt
function allowDrop(event) {
    event.preventDefault();
}

// Funktion zum Hervorheben eines Containers beim Ziehen
function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

// Funktion zum Entfernen der Hervorhebung eines Containers beim Verlassen
function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

// Aktualisiere den Status einer Aufgabe in der Datenbank
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
        const rootKey = await getTaskRootKey();  // Root-Schlüssel für Tasks abrufen
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

            // Überprüfen, ob die Aufgabe bereits im Container vorhanden ist
            const existingTaskElement = document.getElementById(`task_${id}`);
            if (!existingTaskElement) {
                const taskHTML = generateTaskHTML({
                    id: id,
                    title: task.title,
                    description: task.description,
                    assignedTo: task.assignedTo || {},
                    priority: task.priority,
                    category: task.category,
                    progress: task.progress || 0
                });
                insertTaskIntoContainer(taskHTML, status);
            } else {
                console.warn(`Task with ID ${id} already exists in the DOM.`);
            }
        });

        initDragAndDrop(); // Nachdem die Tasks geladen wurden, Drag-and-Drop initialisieren

    } catch (error) {
        console.error('Error loading tasks from database:', error);
    }
}

// HTML für eine Aufgabe generieren
function generateTaskHTML(task) {
    const { id, title, description, assignedTo, priority, category, progress } = task;

    let assignedToDisplay = 'Unassigned';
    if (typeof assignedTo === 'object' && assignedTo !== null) {
        assignedToDisplay = Object.values(assignedTo).join(', ');
    } else if (typeof assignedTo === 'string') {
        assignedToDisplay = assignedTo;
    }

    return `
        <div draggable="true" class="todo" id="task_${id}">
            <div>
                <div class="choose-phase"><img draggable="false" src="./assets/img/Menu Contact options.svg" alt="Phase"></div>
                <div class="category-dd">${category || 'Uncategorized'}</div>
                <div class="titel-dd">${title || 'No Title'}</div>
                <div class="description-dd">${description || 'No Description'}</div>
                <div class="progress-dd">
                    <div class="progressBar-dd">---</div>
                    <div class="progressNumber-dd">${progress || 0}/100</div>
                </div>
                <div class="bottom-dd">
                    <div class="user-dd">${assignedToDisplay}</div>
                    <div class="prio-dd">${priority || 'low'}</div>
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
    button.classList.add('active', `active-${button.id}`);
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
        loadTasksFromDatabase(); // Lade die Aufgaben neu
    } catch (error) {
        console.error('Error saving task:', error);
    }
}
