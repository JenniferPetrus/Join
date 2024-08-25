let API_URL = "https://join-d67a5-default-rtdb.europe-west1.firebasedatabase.app";
let todos = []; // Array zum Speichern der Aufgaben

// document.addEventListener('DOMContentLoaded', () => {
//     init();
//     includeHTML();
//     loadTasksFromDatabase();
// });

const colors = [
    '#A8A8A8', '#D1D1D1', '#CDCDCD', '#007CEE', '#FF7A00', '#FF5EB3',
    '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E',
    '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'
];



document.addEventListener('DOMContentLoaded', () => {
    if (typeof init === 'function') {
        init();  // Aufruf der Init-Funktion
    }

    if (typeof includeHTML === 'function') {
        includeHTML();  // Einfügen der HTML-Komponenten
    }

    if (typeof loadTasksFromDatabase === 'function') {
        loadTasksFromDatabase();  // Laden der Aufgaben
    }
});



// Funktion zum Konvertieren von Arrays in Objekte
function convertArrayToObject(array) {
    const obj = {};
    array.forEach((item, index) => {
        obj[`item_${index}`] = item;
    });
    return obj;
}

// Funktion zur Bereinigung der Datenbank
async function cleanUpDatabase() {
    const API_URL = "https://join-d67a5-default-rtdb.europe-west1.firebasedatabase.app";
    
    try {
        // Hole die Daten aus der Firebase-Datenbank
        const response = await fetch(`${API_URL}/2/tasks.json`);
        if (!response.ok) {
            throw new Error('Failed to fetch tasks from Firebase');
        }
        
        const tasks = await response.json();
        const cleanedTasks = {};

        // Durchlaufe alle Tasks und bereinige die Struktur
        Object.keys(tasks).forEach(taskId => {
            const task = tasks[taskId];
            if (task && task.title) {
                // Entferne ungültige Felder
                if (task.dueDate === 'Invalid Date') {
                    task.dueDate = null; // oder setze ein gültiges Datum
                }

                // Konvertiere Arrays in Objekte
                if (Array.isArray(task.subtasks)) {
                    task.subtasks = convertArrayToObject(task.subtasks);
                }
                if (Array.isArray(task.assignedTo)) {
                    task.assignedTo = convertArrayToObject(task.assignedTo);
                }

                cleanedTasks[taskId] = task;
            } else {
                console.warn(`Task with id ${taskId} is invalid or undefined, skipping.`);
            }
        });

        // Überschreibe die bereinigten Tasks in der Firebase-Datenbank
        const putResponse = await fetch(`${API_URL}/2/tasks.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cleanedTasks)
        });

        if (!putResponse.ok) {
            throw new Error('Failed to update tasks in Firebase');
        }

        console.log('Database cleaned up successfully');
    } catch (error) {
        console.error('Error during database cleanup:', error);
    }
}
