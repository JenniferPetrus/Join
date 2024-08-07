function openOverlay() {
    document.getElementById('addTaskOverlay').style.display = 'flex';
    document.getElementById('dueDate').min = new Date().toISOString().split('T')[0];
}

function closeOverlay() {
    document.getElementById('addTaskOverlay').style.display = 'none';
}

function addSubtask() {
    const subtaskInput = document.getElementById('newSubtask');
    const subtaskText = subtaskInput.value.trim();

    if (subtaskText) {
        const subtaskList = document.getElementById('subtaskList');
        const subtaskItem = document.createElement('div');
        subtaskItem.className = 'subtask-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        const label = document.createElement('label');
        label.textContent = subtaskText;

        subtaskItem.appendChild(checkbox);
        subtaskItem.appendChild(label);
        subtaskList.appendChild(subtaskItem);

        subtaskInput.value = '';
    }
}