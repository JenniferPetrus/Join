
let todos = [{
    'id': 0,
    'title': 'Putzen',
    'category': 'ToDo'
}, {
    'id': 1,
    'title': 'Kochen',
    'category': 'ToDo'
}, {
    'id': 2,
    'title': 'Einkaufen',
    'category': 'closed'
}];

let currentDraggedElement;

function updateHTML() {
    let ToDo = todos.filter(t => t['category'] == 'ToDo');

    document.getElementById('ToDo').innerHTML = '';
    document.getElementById('ToDo').innerHTML = '<div id="ToDo">To Do</div>'

    for (let index = 0; index < ToDo.length; index++) {
        const element = ToDo[index];
        document.getElementById('ToDo').innerHTML += generateTodoHTML(element);
    }

    let InProgress = todos.filter(t => t['category'] == 'InProgress');

    document.getElementById('InProgress').innerHTML = '';
    document.getElementById('InProgress').innerHTML = "<div id='InProgress'>In Progress</div>"

    for (let index = 0; index < InProgress.length; index++) {
        const element = InProgress[index];
        document.getElementById('InProgress').innerHTML += generateTodoHTML(element);
    }

    let AwaitFeedback = todos.filter(t => t['category'] == 'AwaitFeedback');

    document.getElementById('AwaitFeedback').innerHTML = '';
    document.getElementById('AwaitFeedback').innerHTML = "<div id='AwaitFeedback'>Await Feedback</div>"

    for (let index = 0; index < AwaitFeedback.length; index++) {
        const element = AwaitFeedback[index];
        document.getElementById('AwaitFeedback').innerHTML += generateTodoHTML(element);
    }

    let Done = todos.filter(t => t['category'] == 'Done');

    document.getElementById('Done').innerHTML = '';
    document.getElementById('Done').innerHTML = "<div id='Done'>Done</div>"

    for (let index = 0; index < Done.length; index++) {
        const element = Done[index];
        document.getElementById('Done').innerHTML += generateTodoHTML(element);
    }
}

function startDragging(id) {
    currentDraggedElement = id;
}

function generateTodoHTML(element) {
    return `<div draggable="true" ondragstart="startDragging(${element['id']})" class="todo">${element['title']}</div>`;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function moveTo(category) {
    todos[currentDraggedElement]['category'] = category;
    updateHTML();
}

function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}