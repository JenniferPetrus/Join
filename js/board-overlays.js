// Bereinigt die Aufgaben in der Datenbank
async function cleanUpTasksInDatabase() {
    try {
        const rootKey = await getTaskRootKey();
        if (!rootKey) {
            throw new Error('Root key for tasks not found');
        }

        const response = await fetch(`${API_URL}/${rootKey}/tasks.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        const tasks = await response.json();
        const cleanedTasks = {};

        // Bereinige die Tasks
        Object.keys(tasks).forEach(taskId => {
            const task = tasks[taskId];
            if (task && task.title) {
                if (task.dueDate === 'Invalid Date') {
                    task.dueDate = null;
                }
                if (Array.isArray(task.subtasks)) {
                    task.subtasks = task.subtasks.filter(subtask => subtask.text);
                }
                cleanedTasks[taskId] = task;
            }
        });

        // Aktualisiere die Datenbank mit den bereinigten Tasks
        const putResponse = await fetch(`${API_URL}/${rootKey}/tasks.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanedTasks)
        });

        if (!putResponse.ok) {
            throw new Error('Failed to update tasks in database');
        }

        console.log('Tasks successfully cleaned up in database');
    } catch (error) {
        console.error('Error cleaning up tasks:', error);
    }
}

// Lädt die Aufgaben aus der Datenbank und fügt sie in das Board ein
async function loadTasksFromDatabase() {
    try {
        await cleanUpTasksInDatabase();  // Bereinige die Aufgaben bevor sie geladen werden

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
            const status = task.status || 'default-status';
            const taskHTML = generateTaskHTML({
                id: id,
                title: task.title || 'No title',
                description: task.description || 'No description',
                assignedTo: task.assignedTo || [],
                priority: task.priority || 'low',
                category: task.category || 'uncategorized',
                subtasks: task.subtasks || [],
                progress: task.progress || 0
            });
            insertTaskIntoContainer(taskHTML, status);
        });
    } catch (error) {
        console.error('Error loading tasks from database:', error);
    }
}

function insertTaskIntoContainer(taskHTML, status) {
    const container = document.getElementById(status);
    if (!container) {
        console.error(`Container with ID '${status}' not found.`);
        return;
    }
    container.insertAdjacentHTML('beforeend', taskHTML);
    rebindEventListeners();
}

function rebindEventListeners() {
    document.querySelectorAll('.todo').forEach(element => {
        const taskId = element.id.split('_')[1]; // IDs sind im Format task_1

        if (taskId) {
            element.setAttribute('ondragstart', `startDragging(${taskId})`);
            console.log(`Bound dragstart event to task with ID: ${taskId}`); // Debugging-Ausgabe
        } else {
            console.error('Task ID not found for element:', element);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    rebindEventListeners(); // Sicherstellen, dass die Event-Listener zu Beginn gebunden sind
});


document.addEventListener('DOMContentLoaded', () => {
    rebindEventListeners(); // Sicherstellen, dass die Event-Listener zu Beginn gebunden sind
});

function generateTaskHTML(task) {
    if (!task) {
        console.error('Invalid task object provided.');
        return '';
    }

    const title = task.title || 'No Title';
    const description = task.description || 'No Description';
    const assignedTo = task.assignedTo ? task.assignedTo.join(', ') : 'Unassigned';
    const category = task.category || 'Uncategorized';
    const progress = task.progress !== undefined ? `${task.progress}/100` : '0/100';

    return `<div draggable="true" ondragstart="startDragging(${task.id})" class="todo" id="task-${task.id}">
        <div>
            <div class="choose-phase"><img draggable="false" src="./assets/img/Menu Contact options.svg" alt="Phase" onclick="openPhaseOverlay(${task.id})"></div>
            <div class="category-dd">${category}</div>
            <div class="titel-dd">${title}</div>
            <div class="description-dd">${description}</div>
            <div class="progress-dd">
                <div class="progressBar-dd">---</div>
                <div class="progressNumber-dd">${progress}</div>
            </div>
            <div class="bottom-dd">
                <div class="user-dd">${assignedTo}</div>
                <div class="prio-dd">||</div>
            </div>
        </div>
    </div>`;
}

function startDragging(id) {
    currentDraggedElement = `task-${id}`;
    console.log('Dragging started for Task ID:', currentDraggedElement);
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

function openOverlay(sectionId) {
    document.getElementById('addTaskOverlay').style.display = 'flex';
    document.getElementById('dueDate').min = new Date().toISOString().split('T')[0];
    resetErrorMessages();
}

function closeOverlay() {
    document.getElementById('addTaskOverlay').style.display = 'none';
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
