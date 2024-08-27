document.addEventListener('DOMContentLoaded', function() {
    loadContactsFromDatabase();
    restrictDateSelection();  // Datumseinschränkung aufrufen
});

// Funktion zum Erstellen einer neuen Aufgabe
async function createTask() {
    if (!validateForm()) {
        return;
    }

    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;

    const assignedTo = Array.from(assignedContacts); // Verwenden der globalen assignedContacts
    const priority = getActivePriority();
    const category = document.getElementById('category').value;

    // Subtasks als Objekt speichern (kein Array)
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
        status: 'todo'  // Standardstatus für neue Aufgaben
    };

    try {
        const taskId = await saveTaskToDatabase(task);
        console.log('Task successfully created with ID:', taskId);
        clearOverlay();  // Overlay nach dem Erstellen der Aufgabe leeren
        showSuccessMessage();  // Erfolgsmeldung anzeigen
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

// Funktion zum Validieren des Formulars
function validateForm() {
    let isValid = true;
    document.querySelectorAll('.error-message').forEach(errorElement => {
        errorElement.textContent = '';
    });

    const title = document.getElementById('taskTitle').value;
    if (!title) {
        document.getElementById('taskTitleError').textContent = 'Title is required';
        isValid = false;
    }

    const dueDate = document.getElementById('dueDate').value;
    if (!dueDate || new Date(dueDate) == "Invalid Date") {
        document.getElementById('dueDateError').textContent = 'Due Date is required';
        isValid = false;
    }

    const category = document.getElementById('category').value;
    if (!category || category === 'Select task category') {
        document.getElementById('categoryError').textContent = 'Category is required';
        isValid = false;
    }

    return isValid;
}

// Funktion zur Erstellung einer neuen Subtask
async function addSubtask() {
    const subtaskInput = document.getElementById('newSubtask');
    const subtaskList = document.getElementById('subtaskList');

    if (subtaskInput.value.trim() !== '') {
        const newSubtask = document.createElement('div');
        newSubtask.className = 'subtask-list-item';
        newSubtask.textContent = subtaskInput.value.trim();
        subtaskList.appendChild(newSubtask);
        subtaskInput.value = '';

        if (!document.querySelector('.subtask-list').previousElementSibling ||
            !document.querySelector('.subtask-list').previousElementSibling.classList.contains('subtask-title')) {
            const subtasksHeader = document.createElement('div');
            subtasksHeader.className = 'subtask-title';
            subtaskList.parentElement.insertBefore(subtasksHeader, subtaskList);
        }
    }
}

// Funktion zum Festlegen der aktiven Priorität
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

// Funktion zum Abrufen der aktiven Priorität
function getActivePriority() {
    const priorityButton = document.querySelector('.priority-button.active');
    return priorityButton ? priorityButton.id : 'low';
}

// Funktion zum Zurücksetzen der Fehlernachrichten
function resetErrorMessages() {
    document.querySelectorAll('.error-message').forEach(errorElement => {
        errorElement.textContent = '';
    });
}

// Funktion zum Leeren des Overlays
function clearOverlay() {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('newSubtask').value = '';
    
    document.getElementById('assignedTo').selectedIndex = 0;
    document.getElementById('category').selectedIndex = 0;
    
    document.getElementById('dueDate').value = '';
    
    const priorityButtons = document.getElementsByClassName('priority-button');
    for (let button of priorityButtons) {
        button.classList.remove('active', 'active-urgent', 'active-medium', 'active-low');
        button.style.backgroundColor = 'white';
        button.style.color = 'black';
        const img = button.querySelector('img');
        switch (button.id) {
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
    
    const subtaskList = document.getElementById('subtaskList');
    subtaskList.innerHTML = '';
    const subtasksHeader = document.querySelector('.subtask-title');
    if (subtasksHeader) {
        subtasksHeader.remove();
    }
    
    resetErrorMessages();
}
