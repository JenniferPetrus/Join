// let todos = [];

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
            if (id === "0" && !task) { // Spezifische Überprüfung für ungültige ID "0"
                console.warn(`Task with id ${id} is null or undefined, skipping.`);
                return; // Überspringen der Verarbeitung für ID "0"
            }
            if (task && task.title) {
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
                insertTaskIntoContainer(taskHTML, task.status);
                todos.push(task); // Task zum todos-Array hinzufügen
            } else {
                console.warn(`Task with id ${id} is null or undefined`);
            }
        });
    } catch (error) {
        console.error('Error loading tasks from database:', error);
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
                container.innerHTML += generateTaskHTML(task);
            });
        }
    });
}

function updateTaskInDatabase(taskId, newStatus) {
    const taskData = { 
        status: newStatus 
        // Weitere Felder hier hinzufügen, wenn notwendig, aber keine Arrays
    };

    getTaskRootKey().then(rootKey => {
        if (!rootKey) {
            throw new Error('Root key for tasks not found');
        }
        
        fetch(`${API_URL}/${rootKey}/tasks/${taskId}.json`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update task in Firebase');
            }
            return response.json();
        })
        .then(data => {
            console.log('Task updated successfully in Firebase:', data);
        })
        .catch(error => {
            console.error('Error updating task in Firebase:', error);
        });
    }).catch(error => {
        console.error('Error getting root key:', error);
    });
}

function generateTaskHTML(element) {
    return `<div draggable="true" ondragstart="startDragging(${element['id']})" class="todo">
    <div>
        <div class="choose-phase"><img draggable="false" src="./assets/img/Menu Contact options.svg" alt="Phase" onclick="openPhaseOverlay(${element['id']})"></div>
        <div class="category-dd">Cat</div>
        <div class="titel-dd">${element.title}</div>
        <div class="description-dd">${element.description}</div>
        <div class="progress-dd">
            <div class="progressBar-dd">---</div>
            <div class="progressNumber-dd">1/2</div>
        </div>
        <div class="bottom-dd">
            <div class="user-dd">PP</div>
            <div class="prio-dd">||</div>
        </div>
    </div>
</div>`;
}

function startDragging(id) {
    currentDraggedElement = id;
    console.log("Dragging started for Task ID:", id); // Debugging-Ausgabe
}

function allowDrop(ev) {
    ev.preventDefault();
}

function moveTo(status) {
    if (!currentDraggedElement) {
        console.error("No task is being dragged.");
        return;
    }

    const taskElement = document.getElementById(currentDraggedElement);
    if (!taskElement) {
        console.error(`Task with id ${currentDraggedElement} not found.`);
        return;
    }

    const targetContainer = document.getElementById(status);
    if (targetContainer) {
        targetContainer.appendChild(taskElement);

        // Aktualisiere den Status in der Datenbank
        updateTaskInDatabase(currentDraggedElement, status);
    } else {
        console.error(`Target container ${status} not found.`);
    }
}

function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

function init() {
    loadTasksFromDatabase();
    updateHTML();
}

// Debugging-Funktion
async function logDatabaseContentsToConsole() {
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

        // Überprüfen, ob Daten existieren und sie ausgeben
        if (data) {
            console.log("Database contents:", data);
        } else {
            console.log("No data found in the database.");
        }
    } catch (error) {
        console.error('Error loading tasks from database:', error);
    }
}
