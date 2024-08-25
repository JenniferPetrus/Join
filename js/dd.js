let currentDraggedElement;

function generateTodoHTML(task) {
    return `<div draggable="true" ondragstart="startDragging(${task.id})" class="todo" id="task-${task.id}">
        <div>
            <div class="choose-phase"><img draggable="false" src="./assets/img/Menu Contact options.svg" alt="Phase" onclick="openPhaseOverlay(${task.id})"></div>
            <div class="category-dd">${task.category || 'Uncategorized'}</div>
            <div class="titel-dd">${task.title || 'No Title'}</div>
            <div class="description-dd">${task.description || 'No Description'}</div>
            <div class="progress-dd">
                <div class="progressBar-dd">---</div>
                <div class="progressNumber-dd">${task.progress || 0}/100</div>
            </div>
            <div class="bottom-dd">
                <div class="user-dd">${task.assignedTo ? task.assignedTo.join(', ') : 'Unassigned'}</div>
                <div class="prio-dd">||</div>
            </div>
        </div>
    </div>`;
}

function startDragging(id) {
    currentDraggedElement = id;
    console.log('Dragging task with ID:', id);
}

function allowDrop(ev) {
    ev.preventDefault();
}

function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

function init() {
    return updateHTML();
}

async function updateTaskPosition(taskId, newStatus) {
    const taskElement = document.getElementById(`task-${taskId}`);
    const task = todos.find(t => t.id === taskId);
    task.status = newStatus;
    
    // Update the status in the UI
    moveTo(newStatus, taskElement);

    try {
        const rootKey = await getTaskRootKey();  // Root-Schlüssel für Tasks abrufen
        if (!rootKey) {
            throw new Error('Root key for tasks not found');
        }

        // Update the task in Firebase
        const taskData = { 
            status: newStatus 
            // Weitere Felder hier hinzufügen, wenn notwendig, aber keine Arrays
        };
        const response = await fetch(`${API_URL}/${rootKey}/tasks/${taskId}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) {
            throw new Error('Failed to update task in Firebase');
        }

        const data = await response.json();
        console.log('Task updated successfully in Firebase:', data);
    } catch (error) {
        console.error('Error updating task in Firebase:', error);
    }
}

function moveTo(status) {
    const taskElement = document.getElementById(`task-${currentDraggedElement}`);
    const targetContainer = document.getElementById(status);
    
    if (targetContainer && taskElement) {
        targetContainer.appendChild(taskElement);
        updateTaskPosition(currentDraggedElement, status);  // Aktualisiere den Status in der Datenbank
    } else {
        console.error('Target container or task element not found:', status, taskElement);
    }
}
