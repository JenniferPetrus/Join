let currentDraggedElement;

function generateTodoHTML(task) {
    return `<div draggable="true" ondragstart="startDragging(${task.id})" class="todo" id="task-${task.id}">
        <div>
            <div class="choose-phase"><img draggable="false" src="./assets/img/Menu Contact options.svg" alt="Phase" onclick="openPhaseOverlay(${task.id})"></div>
            <div class="category-dd">${task.category || 'Uncategorized'}</div>
            <div class="titel-dd">${task.title || 'No Title'}</div>
            <div class="description-dd">${task.description || 'No Description'}</div>
            <div class="progress-dd">
                <div class="progressBar-dd">---</div>
                <div class="progressNumber-dd">${task.progress || 0}/100</div>
            </div>
            <div class="bottom-dd">
                <div class="user-dd">${task.assignedTo ? task.assignedTo.join(', ') : 'Unassigned'}</div>
                <div class="prio-dd">||</div>
            </div>
        </div>
    </div>`;
}

async function loadTasksFromDatabase() {
    try {
        const rootKey = await getTaskRootKey(); // Root-Schlüssel für Tasks abrufen
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
            if (id === "0" && !task) {
                console.warn(`Task with id ${id} is null or undefined, skipping.`);
                return;
            }
            if (task && task.title) {
                const taskHTML = generateTodoHTML({
                    id: id,
                    title: task.title || 'No title',
                    description: task.description || 'No description',
                    assignedTo: task.assignedTo || [],
                    priority: task.priority || 'low',
                    category: task.category || 'uncategorized',
                    subtasks: task.subtasks || [],
                    progress: task.progress || 0
                });
                insertTaskIntoContainer(taskHTML, task.status);
                todos.push(task); // Task zum todos-Array hinzufügen
            } else {
                console.warn(`Task with id ${id} is null or undefined`);
            }
        });
        updateHTML();
        hidePlaceholders(); // Platzhalter basierend auf den geladenen Tasks verbergen
    } catch (error) {
        console.error('Error loading tasks from database:', error);
    }
}

function startDragging(id) {
    currentDraggedElement = id;
    console.log('Dragging task with ID:', id);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function moveTo(status) {
    if (!currentDraggedElement) {
        console.error("No task is being dragged.");
        return;
    }

    const taskElement = document.getElementById(`task-${currentDraggedElement}`);
    if (!taskElement) {
        console.error(`Task with id ${currentDraggedElement} not found.`);
        return;
    }

    const targetContainer = document.getElementById(status);
    if (targetContainer) {
        console.log(`Moving task ID ${currentDraggedElement} to ${status}`);
        targetContainer.appendChild(taskElement);
        updateTaskPosition(currentDraggedElement, status); // Status des Tasks aktualisieren
        hidePlaceholders(); // Platzhalter basierend auf den verschobenen Tasks verbergen
    } else {
        console.error(`Target container ${status} not found.`);
    }

    // Reset currentDraggedElement after moving the task
    currentDraggedElement = null;
}

function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

async function updateTaskPosition(taskId, newStatus) {
    const task = todos.find(t => t.id === taskId);
    if (task) {
        task.status = newStatus;

        try {
            const rootKey = await getTaskRootKey();  // Root-Schlüssel für Tasks abrufen
            if (!rootKey) {
                throw new Error('Root key for tasks not found');
            }

            // Update the task in Firebase
            const taskData = { 
                status: newStatus 
            };
            const response = await fetch(`${API_URL}/${rootKey}/tasks/${taskId}.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                throw new Error('Failed to update task in Firebase');
            }

            const data = await response.json();
            console.log('Task updated successfully in Firebase:', data);
        } catch (error) {
            console.error('Error updating task in Firebase:', error);
        }
    } else {
        console.error(`Task with id ${taskId} not found in todos array.`);
    }
}

function insertTaskIntoContainer(taskHTML, status) {
    const container = document.getElementById(status);
    if (container) {
        container.insertAdjacentHTML('beforeend', taskHTML);
    } else {
        console.error(`Container ${status} not found`);
    }
}

function updateHTML() {
    const statusTexts = {
        'todo': 'No tasks to do',
        'in-progress': 'No tasks in progress',
        'await-feedback': 'No tasks awaiting feedback',
        'done': 'No tasks completed'
    };

    Object.keys(statusTexts).forEach(status => {
        const tasks = todos.filter(t => t.status === status);
        const container = document.getElementById(status);

        container.innerHTML = ''; // Container leeren

        if (tasks.length === 0) {
            container.innerHTML = `<p class="placeholder-text">${statusTexts[status]}</p>`;
        } else {
            tasks.forEach(task => {
                container.innerHTML += generateTodoHTML(task);
            });
        }
    });
}

function hidePlaceholders() {
    ['todo', 'in-progress', 'await-feedback', 'done'].forEach(status => {
        const container = document.getElementById(status);
        const placeholder = container.querySelector('p');
        if (container.children.length > 1 && placeholder) { 
            placeholder.style.display = 'none';
        }
    });
}

function init() {
    loadTasksFromDatabase();
}
