let targetSectionId = 'todo'; // Standardbereich beim Button Add task -> soll in todo
function openOverlay(sectionId) {
    if (sectionId) {
        targetSectionId = sectionId;} // sectionID -> todo, in progress und await feedback
    document.getElementById('addTaskOverlay').style.display = 'flex';
    document.getElementById('dueDate').min = new Date().toISOString().split('T')[0];
    resetErrorMessages();
}

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
            activeImg.src = '/assets/icons/Board-icons/urgent-white.svg';
            break;
        case 'medium':
            activeImg.src = '/assets/icons/Board-icons/medium-white.svg';
            break;
        case 'low':
            activeImg.src = '/assets/icons/Board-icons/low-white.svg';
            break;
    }
}

function createTask() {
    if (!validateForm()) {
        return;}
    let title = document.getElementById('taskTitle').value;
    let description = document.getElementById('taskDescription').value;
    let assignedTo = Array.from(document.getElementById('assignedTo').selectedOptions).map(option => option.value);
    let dueDate = document.getElementById('dueDate').value;
    
    let priorityButton = document.querySelector('.priority-button.active');
    let priority = priorityButton ? priorityButton.id : 'low';
    
    let category = document.getElementById('category').value;
    let subtasks = Array.from(document.querySelectorAll('#subtaskList .subtask-list-item')).map(item => item.textContent);
    
    let subtasksHTML = '';
    if (subtasks.length > 0) {
        subtasksHTML = `
            <div><strong>Subtasks:</strong></div>
            <ul>
                ${subtasks.map(subtask => `<li>${subtask}</li>`).join('')}
            </ul>
        `;
    }
    let newTaskHTML = `
        <div class="task" draggable="true" ondragstart="drag(event)">
            <h3>${title}</h3>
            <p>${description}</p>
            ${subtasksHTML}
            <div>Assigned to: ${assignedTo.join(', ')}</div>
            <div>Due date: ${dueDate}</div>
            <div><strong>Priority:</strong> ${priority.charAt(0).toUpperCase() + priority.slice(1)}</div>
            <div>Category: ${category}</div>
        </div>
    `;
    
    let container = document.getElementById(targetSectionId);
    if (container) {
        container.insertAdjacentHTML('beforeend', newTaskHTML);
    } else {
        console.error(`Container ${targetSectionId} not found`);
    }
    
    targetSectionId = null;
    
    closeOverlay();
}

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
            subtasksHeader.innerHTML = '<strong>Subtasks:</strong>';
            subtaskList.parentElement.insertBefore(subtasksHeader, subtaskList);
        }
    }
}