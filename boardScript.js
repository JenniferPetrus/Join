
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
    document.getElementById('ToDo').innerHTML = '<div id="toDo"><div>To Do</div><div style="cursor: pointer;" onclick=`addTasks(ToDo)`><img src="assets/img/plus.png"></div></div>'

    for (let index = 0; index < ToDo.length; index++) {
        const element = ToDo[index];
        document.getElementById('ToDo').innerHTML += generateTodoHTML(element);
    }

    if(ToDo.length == 0){
        document.getElementById('ToDo').innerHTML += /*html*/`<div class="nothingInside">Nothing To Do</div>`
    }

    let InProgress = todos.filter(t => t['category'] == 'InProgress');

    document.getElementById('InProgress').innerHTML = '';
    document.getElementById('InProgress').innerHTML = "<div id='inProgress'><div>In Progress</div><div style='cursor: pointer;' onclick=`addTasks(InProgress)`><img src='assets/img/plus.png'></div></div>"

    for (let index = 0; index < InProgress.length; index++) {
        const element = InProgress[index];
        document.getElementById('InProgress').innerHTML += generateTodoHTML(element);
    }
    if(InProgress.length == 0){
        document.getElementById('InProgress').innerHTML += /*html*/`<div class="nothingInside">Nothing in Progress</div>`
    }

    let AwaitFeedback = todos.filter(t => t['category'] == 'AwaitFeedback');

    document.getElementById('AwaitFeedback').innerHTML = '';
    document.getElementById('AwaitFeedback').innerHTML = "<div id='awaitFeedback'><div>Await Feedback</div><div style='cursor: pointer;' onclick=`addTasks(AwaitFeedback)`><img src='assets/img/plus.png'></div></div>"

    for (let index = 0; index < AwaitFeedback.length; index++) {
        const element = AwaitFeedback[index];
        document.getElementById('AwaitFeedback').innerHTML += generateTodoHTML(element);
    }
    if(InProgress.length == 0){
        document.getElementById('AwaitFeedback').innerHTML += /*html*/`<div class="nothingInside">No Feedback</div>`
    }
    

    let Done = todos.filter(t => t['category'] == 'Done');

    document.getElementById('Done').innerHTML = '';
    document.getElementById('Done').innerHTML = "<div id='done'><div>Done</div><div style='cursor: pointer;' onclick=`addTasks(Done)`><img src='assets/img/plus.png'></div></div>"

    for (let index = 0; index < Done.length; index++) {
        const element = Done[index];
        document.getElementById('Done').innerHTML += generateTodoHTML(element);
    }
    if(InProgress.length == 0){
        document.getElementById('Done').innerHTML += /*html*/`<div class="nothingInside">Nothing Finished</div>`
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