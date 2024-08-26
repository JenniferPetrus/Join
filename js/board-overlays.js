async function loadTasksFromDatabase() {
    try {
        const response = await fetch(`${API_URL}/2/tasks.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        console.log("Loaded tasks data from database:", data);  // Überprüfung der Daten

        Object.entries(data || {}).forEach(([id, task]) => {
            if (isValidTask(task)) {
                const taskHTML = generateTaskHTML(mapTaskToHTMLData(task, id));
                insertTaskIntoContainer(taskHTML, task.status || 'todo');
            } else {
                console.warn(`Task with id ${id} is invalid or undefined.`);
            }
        });
    } catch (error) {
        console.error('Error loading tasks from database:', error);
    }
}


function isValidTask(task) {
    return task && task.title;
}

function mapTaskToHTMLData(task, id) {
    return {
        id: id,
        title: task.title || 'No title',
        description: task.description || 'No description',
        assignedTo: task.assignedTo || [],
        priority: task.priority || 'low',
        category: task.category || 'uncategorized',
        subtasks: task.subtasks || [],
        progress: task.progress || 0
    };
}

function insertTaskIntoContainer(taskHTML, status) {
    console.log(`Inserting task into container with status: ${status}`);  // Überprüfung der Status-Zuweisung
    const container = document.getElementById(status.toLowerCase());
    if (container) {
        container.insertAdjacentHTML('beforeend', taskHTML);
        console.log(`Task successfully inserted into container with status: ${status}`);
        rebindEventListeners();
    } else {
        console.error(`Container with ID '${status}' not found.`);
    }
}

function rebindEventListeners() {
    document.querySelectorAll('.todo').forEach(element => {
        const taskId = extractTaskIdFromElement(element);
        element.setAttribute('ondragstart', `startDragging(${taskId})`);
    });
}

function extractTaskIdFromElement(element) {
    return element.id.split('-')[1];
}

document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromDatabase();
    rebindEventListeners(); // Ensure event listeners are bound at startup
});

function generateTaskHTML(task) {
    console.log("Generating HTML for task:", task);  // Überprüfung der Task-Daten

    const title = task.title || 'No Title';
    const description = task.description || 'No Description';
    const assignedTo = typeof task.assignedTo === 'object' ? Object.values(task.assignedTo).join(', ') : 'Unassigned';
    const category = task.category || 'Uncategorized';
    const progress = `${task.progress}/100`;

    return `
    <div draggable="true" ondragstart="startDragging(${task.id})" class="todo" id="task-${task.id}">
        <div>
            <div class="choose-phase">
                <img draggable="false" src="./assets/img/Menu Contact options.svg" alt="Phase" onclick="openPhaseOverlay(${task.id})">
            </div>
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
    currentDraggedElement = id;
    console.log('Dragging started for Task ID:', id);
}

function allowDrop(event) {
    event.preventDefault();
}

function openOverlay(sectionId) {
    const overlay = document.getElementById('addTaskOverlay');
    overlay.style.display = 'flex';
    setMinimumDueDate();
    resetErrorMessages();
}

function closeOverlay() {
    document.getElementById('addTaskOverlay').style.display = 'none';
}

function validateForm() {
    let isValid = true;
    clearErrorMessages();

    const title = document.getElementById('taskTitle').value;
    const dueDate = document.getElementById('dueDate').value;
    const category = document.getElementById('category').value;

    if (!title) {
        showError('taskTitleError', 'Title is required');
        isValid = false;
    }
    if (!dueDate) {
        showError('dueDateError', 'Due Date is required');
        isValid = false;
    }
    if (!category || category === 'Select task category') {
        showError('categoryError', 'Category is required');
        isValid = false;
    }

    return isValid;
}

function resetErrorMessages() {
    clearErrorMessages();
}

function clearErrorMessages() {
    document.querySelectorAll('.error-message').forEach(errorElement => {
        errorElement.textContent = '';
    });
}

function showError(elementId, message) {
    document.getElementById(elementId).textContent = message;
}

function setMinimumDueDate() {
    document.getElementById('dueDate').min = new Date().toISOString().split('T')[0];
}
