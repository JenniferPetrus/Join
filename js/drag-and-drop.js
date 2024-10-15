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

            const baseTaskId = taskId.replace(/^task_/, ''); // Entferne nur den Präfix 'task_' einmal
            taskElement.id = `task_${baseTaskId}-${newStatus}`;
            console.log(`Updated task ID to: ${taskElement.id}`);

            await updateTaskStatusInDatabase(baseTaskId, newStatus);
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

        const response = await fetch(`${API_URL}/${rootKey}/tasks/task_${taskId}.json`, {
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

            const status = task.status || 'todo'; // Standard-Status 'todo' verwenden, wenn kein Status vorhanden ist

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
