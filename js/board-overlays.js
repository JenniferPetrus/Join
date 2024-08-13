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
<<<<<<< Updated upstream
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const assignedTo = Array.from(document.getElementById('assignedTo').selectedOptions).map(option => option.value);
    const priority = getActivePriority();
    const category = document.getElementById('category').value;
    const subtasks = getSubtasks();
    const progress = calculateProgress(subtasks);
    const task = {
        title,
        description,
        assignedTo,
        priority,
        category,
        subtasks,
        progress,
    };
    try {
        const taskId = await saveTaskToDatabase(task); // Speichert die Aufgabe und erhält die ID
        const taskHTML = generateTaskHTML(title, description, assignedTo, priority, category, subtasks, progress, taskId);
        insertTaskIntoContainer(taskHTML);
        closeOverlay();
    } catch (error) {
        console.error('Error creating task:', error);
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
// Berechnet den Fortschritt
function calculateProgress(subtasks) {
    const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
    const totalSubtasks = subtasks.length;
    return totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
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
=======
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
>>>>>>> Stashed changes
    if (container) {
        container.insertAdjacentHTML('beforeend', newTaskHTML);
    } else {
        console.error(`Container ${targetSectionId} not found`);
    }
    
    targetSectionId = null;
    
    closeOverlay();
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
<<<<<<< Updated upstream
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
        return data.name; // Gibt die ID des gespeicherten Tasks zurück
    } catch (error) {
        console.error('Error saving task to database:', error);
        throw error;
    }
}

async function loadTasksFromDatabase() {
    try {
        let response = await fetch(`${API_URL}/tasks.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        let data = await response.json();
        if (data) {
            // Durchlaufe alle Tasks und füge sie in den Container ein
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    let task = data[key];
                    const taskHTML = generateTaskHTML(task.title, task.description, task.assignedTo, task.priority, task.category, task.subtasks, task.progress, key);
                    insertTaskIntoContainer(taskHTML);
                }
            }
        }
    } catch (error) {
        console.error('Error loading tasks from database:', error);
    }
}
// AUFGABE DETAILANSICHT
function generateTaskHTML(title, description, assignedTo, priority, category, subtasks, progress, taskId) {
    const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
    const totalSubtasks = subtasks.length;
    const progressBarWidth = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    const progressBarColor = progressBarWidth > 0 ? '#4589FF' : '#e0e0e0'; 
    const priorityImgSrc = getPriorityImageSrc(priority);
    const categoryClass = category === 'User Story' ? 'user-story-background' : 
                          category === 'Technical Task' ? 'technical-task-background' : '';
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
            <div class="task-category ${categoryClass}">${category}</div>
            <div class="task-title">${title}</div>
            <div class="task-description">${description}</div>
            <div class="task-progress-container">
                <div class="task-progress-bar" style="width: ${progressBarWidth}%; background-color: ${progressBarColor};"></div>
                <div class="task-progress-text">${completedSubtasks}/${totalSubtasks} Subtasks</div>
            </div>
            <img class="task-priority-img" src="${priorityImgSrc}" alt="Priority Icon">
        </div>
    `;
}

let currentTaskId = null;

function openTaskDetailOverlay(task, taskId) {
    currentTaskId = taskId;
    const categoryClass = task.category === 'User Story' ? 'user-story-background' : 
                          task.category === 'Technical Task' ? 'technical-task-background' : '';

    document.getElementById('taskDetailOverlay').innerHTML = `
        <div class="task-detail-container">
            <div class="task-detail-header">
                <button class="close-button-details" onclick="closeTaskDetailOverlay()">x</button>
                <div class="task-detail-category ${categoryClass}">${task.category}</div>
            </div>
            <div id="taskDetailsView">
                <h1 class="task-detail-title">${task.title}</h1>
                <p class="task-detail-description">${task.description}</p>
                <p>Due Date: ${task.dueDate}</p>
                <p>Priority: ${task.priority} 
                    <img src="${getPriorityImageSrc(task.priority)}" alt="${task.priority} Priority" class="priority-image">
                </p>
                <p>Assigned To: ${task.assignedTo.join(', ')}</p>
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
                    <button onclick="editTask()">Edit</button>
                    <button onclick="deleteTask()">Delete</button>
                </div>
            </div>
            ${createEditForm(task)}
        </div>
    `;
    document.getElementById('taskDetailOverlay').style.display = 'flex';
}

function createEditForm(task) {
    return `
        <form id="taskEditForm" style="display: none;">
            <div>
                <label for="editTitle">Title:</label>
                <input type="text" id="editTitle" value="${task.title}">
            </div>
            <div>
                <label for="editDescription">Description:</label>
                <textarea id="editDescription">${task.description}</textarea>
            </div>
            <div>
                <label for="editDueDate">Due Date:</label>
                <input type="date" id="editDueDate" value="${task.dueDate}">
            </div>
            <div>
                <label for="editPriority">Priority:</label>
                <select id="editPriority">
                    <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                </select>
            </div>
            <div>
                <label for="editCategory">Category:</label>
                <select id="editCategory">
                    <option value="User Story" ${task.category === 'User Story' ? 'selected' : ''}>User Story</option>
                    <option value="Technical Task" ${task.category === 'Technical Task' ? 'selected' : ''}>Technical Task</option>
                </select>
            </div>
            <div>
                <label for="editAssignedTo">Assigned To:</label>
                <select id="editAssignedTo" multiple>
                    <!-- Populate with options as needed -->
                </select>
            </div>
            <div>
                <label for="editSubtasks">Subtasks:</label>
                <div id="editSubtasks">
                    ${task.subtasks.map(subtask => `
                        <div class="edit-subtask">
                            <input type="checkbox" ${subtask.completed ? 'checked' : ''}>
                            <input type="text" value="${subtask.text}">
                        </div>`).join('')}
                </div>
            </div>
            <div class="overlay-buttons">
                <button type="button" onclick="saveEditedTask()">Save</button>
                <button type="button" onclick="cancelEdit()">Cancel</button>
            </div>
        </form>
    `;
}

async function saveEditedTask() {
    const title = document.getElementById('editTitle').value;
    const description = document.getElementById('editDescription').value;
    const dueDate = document.getElementById('editDueDate').value;
    const priority = document.getElementById('editPriority').value;
    const category = document.getElementById('editCategory').value;
    const assignedTo = Array.from(document.getElementById('editAssignedTo').selectedOptions).map(option => option.value);
    const subtasks = Array.from(document.querySelectorAll('#editSubtasks .edit-subtask')).map(item => ({
        text: item.querySelector('input[type="text"]').value,
        completed: item.querySelector('input[type="checkbox"]').checked
    }));

    const updatedTask = {
        title,
        description,
        dueDate,
        priority,
        category,
        assignedTo,
        subtasks,
        progress: calculateProgress(subtasks) // Recalculate progress
    };

    try {
        let response = await fetch(`${API_URL}/tasks/${currentTaskId}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTask)
        });

        if (!response.ok) {
            throw new Error('Failed to update task in database');
        }

        console.log('Task updated successfully');
        const taskHTML = generateTaskHTML(title, description, assignedTo, priority, category, subtasks, updatedTask.progress, currentTaskId);
        updateTaskInUI(currentTaskId, taskHTML);
        closeTaskDetailOverlay();
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

function updateTaskInUI(taskId, taskHTML) {
    const existingTask = document.getElementById(taskId);
    if (existingTask) {
        existingTask.innerHTML = taskHTML;
    } else {
        console.error(`Task with ID ${taskId} not found in the UI.`);
    }
}

function closeTaskDetailOverlay() {
    document.getElementById('taskDetailOverlay').style.display = 'none';
    currentTaskId = null;
}

function editTask() {
    document.getElementById('taskDetailsView').style.display = 'none';
    document.getElementById('taskEditForm').style.display = 'block';
}
function cancelEdit() {
    document.getElementById('taskDetailsView').style.display = 'block';
    document.getElementById('taskEditForm').style.display = 'none';
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

async function deleteTask() {
    if (!currentTaskId) {
        console.error('No task selected for deletion.');
        return;
    }
    try {
        // Lösche die Aufgabe aus der Firebase-Datenbank
        let response = await fetch(`${API_URL}/tasks/${currentTaskId}.json`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete task from database');
        }
        // löscht die Aufgabe aus dem Board
        removeTaskFromBoard(currentTaskId);
        closeTaskDetailOverlay();
=======
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
>>>>>>> Stashed changes
    } catch (error) {
        console.error('Error saving task to database:', error);
        throw error;
    }
}

<<<<<<< Updated upstream
// Entfernt eine Aufgabe aus dem DOM
function removeTaskFromBoard(taskId) {
    const taskElement = document.getElementById(taskId);
    if (taskElement) {
        taskElement.remove();
    } else {
        console.error(`Task with ID ${taskId} not found in the UI.`);
    }
}
=======
async function createTask() {
    if (!validateForm()) {
        return;
    }
    let title = document.getElementById('taskTitle').value;
    let description = document.getElementById('taskDescription').value;
    let assignedTo = Array.from(document.getElementById('assignedTo').selectedOptions).map(option => option.value);
    let dueDate = document.getElementById('dueDate').value;
    
    let priorityButton = document.querySelector('.priority-button.active');
    let priority = priorityButton ? priorityButton.id : 'low';
    
    let category = document.getElementById('category').value;
    let subtasks = Array.from(document.querySelectorAll('#subtaskList .subtask-list-item')).map(item => item.textContent);
    let newTask = {
        title: title,
        description: description,
        assignedTo: assignedTo,
        dueDate: dueDate,
        priority: priority,
        category: category,
        subtasks: subtasks
    };
    try {
        let taskId = await saveTaskToDatabase(newTask);
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
            <div class="task" draggable="true" ondragstart="drag(event)" data-id="${taskId}">
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
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

>>>>>>> Stashed changes
