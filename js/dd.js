let todos = [{
    'id': 0,
    'title': 'Putzen',
    'phase': 'todo'
}, {
    'id': 1,
    'title': 'Kochen',
    'phase': 'todo'
}, {
    'id': 2,
    'title': 'Einkaufen',
    'phase': 'done'
}];

let currentDraggedElement;

function updateHTML() {
    let todo = todos.filter(t => t['phase'] == 'todo');
    let inProgress = todos.filter(t => t['phase'] == 'in-progress');
    let awaitFeedback = todos.filter(t => t['phase'] == 'await-feedback');
    let done = todos.filter(t => t['phase'] == 'done');
    document.getElementById('todo').innerHTML = '';
    document.getElementById('in-progress').innerHTML = '';
    document.getElementById('await-feedback').innerHTML = '';
    document.getElementById('done').innerHTML = '';
    for (let index = 0; index < todo.length; index++) {
        const element = todo[index];
        document.getElementById('todo').innerHTML += generateTodoHTML(element);
    }
    for (let index = 0; index < inProgress.length; index++) {
        const element = inProgress[index];
        document.getElementById('in-progress').innerHTML += generateTodoHTML(element);
    }
    for (let index = 0; index < awaitFeedback.length; index++) {
        const element = awaitFeedback[index];
        document.getElementById('await-feedback').innerHTML += generateTodoHTML(element);
    }
    for (let index = 0; index < done.length; index++) {
        const element = done[index];
        document.getElementById('done').innerHTML += generateTodoHTML(element);
    }
}

function startDragging(id) {
    currentDraggedElement = id;
}

function updateHTML() {
    const phaseTexts = {
        'todo': 'No tasks to do',
        'in-progress': 'No tasks in progress',
        'await-feedback': 'No tasks awaiting feedback',
        'done': 'No tasks completed'
    };
    Object.keys(phaseTexts).forEach(phase => {
        const tasks = todos.filter(t => t['phase'] === phase);
        const container = document.getElementById(phase);
        container.innerHTML = '';  // Clear the container
        if (tasks.length === 0) {
            container.innerHTML = `<p class="placeholder-text">${phaseTexts[phase]}</p>`;
        } else {
            tasks.forEach(task => {
                container.innerHTML += generateTodoHTML(task);
            });
        }
    });
}

function generateTodoHTML(element) {
    return `<div draggable="true" ondragstart="startDragging(${element['id']})" class="todo">
    <div>
        <div class="choose-phase" ><img draggable="false" src="./assets/img/Menu Contact options.svg" alt="Phase" onclick="openPhaseOverlay(${element['id']})"></div>
        <div class="category-dd">Cat</div>
        <div class="titel-dd">Titel</div>
        <div class="description-dd">Descr</div>
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

// Öffne das Phase-Overlay
function openPhaseOverlay(id) {
    const task = todoso.find(t => t.id === id);
    const availablePhases = ['todo', 'in-progress', 'await-feedback', 'done'].filter(phase => phase !== task.phase);
    
    let overlayContent = `<div class="phase-options">`;
    availablePhases.forEach(phase => {
        overlayContent += `<div onclick="moveTaskToPhase(${id}, '${phase}')">${phase}</div>`;
    });
    overlayContent += `</div>`;

    const overlay = document.getElementById('phase-overlay');
    overlay.innerHTML = overlayContent;
    overlay.style.display = 'block';

    window.addEventListener('scroll', closePhaseOverlay);
    window.addEventListener('resize', closePhaseOverlay);
}

// Verschiebe den Task in eine andere Phase
function moveTaskToPhase(id, phase) {
    const task = todoso.find(t => t.id === id);
    task.phase = phase;

    updateHTML(); // Aktualisiere das HTML, um die Änderung anzuzeigen

    closePhaseOverlay(); // Schließe das Overlay
}

// Schließe das Phase-Overlay
function closePhaseOverlay() {
    const overlay = document.getElementById('phase-overlay');
    overlay.style.display = 'none';

    window.removeEventListener('scroll', closePhaseOverlay);
    window.removeEventListener('resize', closePhaseOverlay);
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

        container.innerHTML = '';  // Container leeren

        if (tasks.length === 0) {
            container.innerHTML = `<p class="placeholder-text">${phaseTexts[phase]}</p>`;
        } else {
            tasks.forEach(task => {
                container.innerHTML += generateTodoHTML(task);
            });
        }
    });
}

function allowDrop(ev) {
    ev.preventDefault();
}

function moveTo(phase) {
    todos[currentDraggedElement]['phase'] = phase;
    updateHTML();
}

function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

function init(){
    return updateHTML();
}

