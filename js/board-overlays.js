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
// Hauptfunktion zum Erstellen einer Aufgabe
function createTask() {
    if (!validateForm()) {
        return;
    }
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const assignedTo = Array.from(document.getElementById('assignedTo').selectedOptions).map(option => option.value);
    const priority = getActivePriority();
    const category = document.getElementById('category').value;
    const subtasks = getSubtasks();
    const progress = calculateProgress(subtasks);

    const taskHTML = generateTaskHTML(title, description, assignedTo, priority, category, subtasks, progress);
    insertTaskIntoContainer(taskHTML);
    closeOverlay();
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
// Berechnet den Fortschritt
function calculateProgress(subtasks) {
    const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
    return `${completedSubtasks}/${subtasks.length} Subtasks`;
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
function insertTaskIntoContainer(taskHTML) {
    const container = document.getElementById(targetSectionId);
    if (container) {
        container.insertAdjacentHTML('beforeend', taskHTML);
    } else {
        console.error(`Container ${targetSectionId} not found`);
    }
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

async function saveTaskToDatabase(task) {
    try {
        let response = await fetch(`${API_URL}/tasks.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        if (!response.ok) {
            throw new Error('Failed to save task to database');
        }
        let data = await response.json();
        console.log('Task saved to database with ID:', data.name);
        return data.name;
    } catch (error) {
        console.error('Error saving task to database:', error);
        throw error;
    }
}
// AUFGABE DETAILANSICHT
function generateTaskHTML(title, description, assignedTo, priority, category, subtasks, progress, taskId) {
    const progressBarWidth = subtasks.length ? (subtasks.filter(subtask => subtask.completed).length / subtasks.length) * 100 : 0;
    const priorityImgSrc = getPriorityImageSrc(priority);
    return `
        <div class="task-card" id="${taskId}" onclick='openTaskDetailOverlay({
            title: "${title}",
            description: "${description}",
            assignedTo: ${JSON.stringify(assignedTo)},
            priority: "${priority}",
            category: "${category}",
            subtasks: ${JSON.stringify(subtasks)},
            progress: "${progress}"
        }, "${taskId}")'>
            <div class="task-category">${category}</div>
            <div class="task-title">${title}</div>
            <div class="task-description">${description}</div>
            <div class="task-progress-container">
                <div class="task-progress-bar" style="width: ${progressBarWidth}%"></div>
                <div class="task-progress-text">${progress}</div>
            </div>
            <div class="task-footer">
                <div class="task-assigned-to">Assigned to: ${assignedTo.join(', ')}</div>
                <div class="task-priority">
                    <img src="${priorityImgSrc}" alt="${priority} Priority">
                </div>
            </div>
        </div>
    `;
}

let currentTaskId = null;

function openTaskDetailOverlay(task, taskId) {
    currentTaskId = taskId;
    document.getElementById('taskDetailOverlay').innerHTML = `
        <div class="task-detail-container">
            <div class="task-detail-header"
                <button class="close-button-details" onclick="closeTaskDetailOverlay()">x</button>
                <div class="task-detail-category">${task.category}</div>
            </div>
            <h1 class="task-detail-title">${task.title}</h1>
            <p class="task-detail-description">${task.description}</p>
            <p>Due Date:${task.dueDate}</p>
            <p>Priority:${task.priority} <img src="${getPriorityImageSrc(task.priority)}" alt="${task.priority} Priority" class="priority-image"></p>
            <p>Assigned To:${task.assignedTo.join(', ')}</p>
            <div class="task-detail-subtasks">
                <p>Subtasks:</p>
                <ul>
                    ${task.subtasks.map(subtask => `
                        <li>
                            <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
                            ${subtask.text}
                        </li>`).join('')}
                </ul>
            </div>
            <div class="overlay-buttons">
            <button onclick="deleteTask()">Delete</button>
                <button onclick="editTask()">Edit</button>
            </div>
        </div>
    `;
    document.getElementById('taskDetailOverlay').style.display = 'flex';
}

function closeTaskDetailOverlay() {
    document.getElementById('taskDetailOverlay').style.display = 'none';
    currentTaskId = null;
}

function editTask() {
    if (currentTaskId) {
        let task = getTaskById(currentTaskId); 
        if (task) {
            populateEditForm(task);
            closeTaskDetailOverlay();
        }
    }
}

function deleteTask() {
    if (currentTaskId) {
        deleteTaskById(currentTaskId)
            .then(() => {
                removeTaskFromUI(currentTaskId);
                closeTaskDetailOverlay();
            })
            .catch(error => {
                console.error('Error deleting task:', error);
            });
    }
}

async function deleteTask(taskId) {
    try {
        let response = await fetch(`${API_URL}/tasks/${taskId}.json`, {
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
    closeTaskDetailOverlay()
}