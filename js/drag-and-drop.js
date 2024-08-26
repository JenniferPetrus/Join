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
