document.addEventListener('DOMContentLoaded', () => {
    function addEventListenersToButtons() {
        document.querySelectorAll('.plus-icon').forEach(icon => {
            icon.addEventListener('mouseover', () => {
                icon.src = './assets/icons/Board-icons/plus icon blue.svg';
            });
            icon.addEventListener('mouseout', () => {
                icon.src = './assets/icons/Board-icons/plus icon black.svg';
            });
            icon.addEventListener('click', () => {
                const sectionId = icon.getAttribute('data-section-id');
                openOverlay(sectionId);
            });
        });
    }

    function loadOverlay() {
        fetch('./board-overlays.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('overlay-container').innerHTML = data;
                addEventListenersToButtons();
                // Event-Listener für das Overlay setzen
                setupOverlayEventListeners();
            })
            .catch(error => console.error('Error loading the overlay:', error));
    }

    function openOverlay(sectionId) {
        loadOverlay(); 
        document.getElementById('addTaskOverlay').style.display = 'flex';
        targetSectionId = sectionId || 'todo'; // Setze den Standardwert, wenn keine Section ID angegeben wurde
    }

    const addTaskButton = document.querySelector('.add-task-button');
    if (addTaskButton) {
        addTaskButton.addEventListener('click', () => {
            openOverlay('todo');
        });
    }

    const searchIcon = document.querySelector('.vector-input-search-item');
    if (searchIcon) {
        searchIcon.addEventListener('mouseover', () => {
            searchIcon.src = './assets/icons/Board-icons/search icon blue.svg';
        });
        searchIcon.addEventListener('mouseout', () => {
            searchIcon.src = './assets/icons/Board-icons/search icon black.svg';
        });
    }

    addEventListenersToButtons();
});

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

// Debugging: Struktur und Inhalte der Datenbank ausgeben
async function logDatabaseStructureAndContent() {
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

        if (data) {
            console.log("Database structure and content:");
            printObjectStructure(data, 0); // Rekursive Funktion zur Anzeige der Struktur
        } else {
            console.log("No data found in the database.");
        }
    } catch (error) {
        console.error('Error loading tasks from database:', error);
    }
}

function printObjectStructure(obj, indent) {
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            console.log(`${' '.repeat(indent)}${key}: {`);
            printObjectStructure(obj[key], indent + 2); // Rekursion für verschachtelte Objekte
            console.log(`${' '.repeat(indent)}}`);
        } else {
            console.log(`${' '.repeat(indent)}${key}: ${obj[key]}`);
        }
    }
}

// Funktion aufrufen, um die Struktur und den Inhalt anzuzeigen
logDatabaseStructureAndContent();

// Funktion zum Setzen der Event-Listener im Overlay
function setupOverlayEventListeners() {
    const createTaskButton = document.querySelector('.create-task-button');
    if (createTaskButton) {
        createTaskButton.addEventListener('click', createTask); // Verwende die globale createTask-Funktion
    }

    const cancelButton = document.querySelector('.cancel-button');
    if (cancelButton) {
        cancelButton.addEventListener('click', clearOverlay); // Verwende die globale clearOverlay-Funktion
    }

    setupEventListeners(); // Rufe die Setup-Funktion auf, die Event-Listener hinzufügt
}
