let todoso = [{
    'id': 0,
    'title': 'Putzen',
    'description': 'Das Haus reinigen',
    'phase': 'todo'
}, {
    'id': 1,
    'title': 'Kochen',
    'description': 'Ein neues Rezept ausprobieren',
    'phase': 'in-progress'
}, {
    'id': 2,
    'title': 'Einkaufen',
    'description': 'Lebensmittel für die Woche kaufen',
    'phase': 'done'
}];

function handleSearchInput() {
    let searchInput = document.getElementById('user-input').value.toLowerCase();
    
    if (searchInput.length >= 3) {
        filterTodos(searchInput);
    } else {
        updateHTML();
    }
}

function filterTodos(searchInput) {
    // Durchlaufe alle Phasen und filtere die Aufgaben
    const phases = ['todo', 'in-progress', 'await-feedback', 'done'];
    
    phases.forEach(phase => {
        const tasks = todoso.filter(todo => 
            todo.phase === phase &&
            (todo.title.toLowerCase().includes(searchInput) || 
            todo.description.toLowerCase().includes(searchInput))
        );

        const container = document.getElementById(phase);
        container.innerHTML = ''; 

        if (tasks.length === 0) {
            container.innerHTML = `<p class="placeholder-text">No tasks for your search in ${phase}</p>`;
        } else {
            tasks.forEach(task => {
                container.innerHTML += generateTodoHTML(task);
            });
        }
    });
}

function generateTodoHTML(task) {
    return `
    <div draggable="true" ondragstart="startDragging(${task.id})" class="todo">
        <div>
            <div class="choose-phase" ><img draggable="false" src="./assets/img/Menu Contact options.svg" alt="Phase" onclick="openPhaseOverlay(${task.id}, event)"></div>
            <div class="category-dd">Cat</div>
            <div class="titel-dd">${task.title}</div>
            <div class="description-dd">${task.description}</div>
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

const phaseNames = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'await-feedback': 'Awaiting Feedback',
    'done': 'Done'
};

// Öffne das Phase-Overlay an der Position des Klicks
function openPhaseOverlay(id, event) {
    event.stopPropagation(); // Verhindert, dass der Klick-Ereignis-Bubble das Dokument erreicht

    const task = todoso.find(t => t.id === id);
    const availablePhases = ['todo', 'in-progress', 'await-feedback', 'done'].filter(phase => phase !== task.phase);
    
    let overlayContent = `<div class="phase-options">`;
    availablePhases.forEach(phase => {
        overlayContent += `<div onclick="moveTaskToPhase(${id}, '${phase}')">${phaseNames[phase]}</div>`;
    });
    overlayContent += `</div>`;

    const overlay = document.getElementById('phase-overlay');
    overlay.innerHTML = overlayContent;
    overlay.style.display = 'block';

    // Positioniere das Overlay an der Klickposition
    overlay.style.top = `${event.clientY}px`;
    overlay.style.left = `${event.clientX}px`;

    document.addEventListener('scroll', closePhaseOverlay);
    window.addEventListener('resize', closePhaseOverlay);
}

// Schließe das Phase-Overlay
function closePhaseOverlay() {
    const overlay = document.getElementById('phase-overlay');
    overlay.style.display = 'none';

    document.removeEventListener('scroll', closePhaseOverlay);
    window.removeEventListener('resize', closePhaseOverlay);
}

document.addEventListener('click', function(event) {
    const overlay = document.getElementById('phase-overlay');
    const isClickInsideOverlay = overlay.contains(event.target);

    if (!isClickInsideOverlay) {
        closePhaseOverlay();
    }
});

document.getElementById('phase-overlay').addEventListener('click', function(event) {
    event.stopPropagation();
});

// Verschiebe den Task in eine andere Phase
function moveTaskToPhase(id, phase) {
    const task = todoso.find(t => t.id === id);
    task.phase = phase;

    updateHTML(); 

    closePhaseOverlay(); 
}

// Schließe das Phase-Overlay
function closePhaseOverlay() {
    const overlay = document.getElementById('phase-overlay');
    overlay.style.display = 'none';
}

// Initialisiert die HTML-Inhalte auf der Seite
function updateHTML() {
    const phaseTexts = {
        'todo': 'No tasks to do',
        'in-progress': 'No tasks in progress',
        'await-feedback': 'No tasks awaiting feedback',
        'done': 'No tasks completed'
    };

    Object.keys(phaseTexts).forEach(phase => {
        const tasks = todoso.filter(t => t.phase === phase);
        const container = document.getElementById(phase);

        container.innerHTML = '';  

        if (tasks.length === 0) {
            container.innerHTML = `<p class="placeholder-text">${phaseTexts[phase]}</p>`;
        } else {
            tasks.forEach(task => {
                container.innerHTML += generateTodoHTML(task);
            });
        }
    });
}

function startDragging(id) {
    currentDraggedElement = id;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function moveTo(phase) {
    todoso[currentDraggedElement]['phase'] = phase;
    updateHTML();
}

function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

function updateHTML() {
    const phaseTexts = {
        'todo': 'No tasks to do',
        'in-progress': 'No tasks in progress',
        'await-feedback': 'No tasks awaiting feedback',
        'done': 'No tasks completed'
    };
    
    Object.keys(phaseTexts).forEach(phase => {
        const tasks = todoso.filter(t => t.phase === phase);
        const container = document.getElementById(phase);
        
        container.innerHTML = ''; 

        if (tasks.length === 0) {
            container.innerHTML = `<p class="placeholder-text">${phaseTexts[phase]}</p>`;
        } else {
            tasks.forEach(task => {
                container.innerHTML += generateTodoHTML(task);
            });
        }
    });
}

function init(){
    updateHTML();
}

document.addEventListener('DOMContentLoaded', updateHTML);
