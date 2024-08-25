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
            })
            .catch(error => console.error('Error loading the overlay:', error));
    }

    function openOverlay(sectionId) {
        loadOverlay(); 
        document.getElementById('addTaskOverlay').style.display = 'flex';
    }

    const addTaskButton = document.querySelector('.add-task-button');
    if (addTaskButton) {
        addTaskButton.addEventListener('click', () => {
            loadOverlay();
            document.getElementById('addTaskOverlay').style.display = 'flex';
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

// Debugging: Struktur und Inhalte der Datenbank ausgeben
async function logDatabaseStructureAndContent() {
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
