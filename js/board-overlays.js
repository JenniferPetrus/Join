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
// Overlay Add Task Buttons
function setActivePriority(button) {
    const buttons = document.getElementsByClassName('priority-button');
    for (let i = 0; i < buttons.length; i++) {
        const img = buttons[i].querySelector('img');
        buttons[i].classList.remove('active-urgent', 'active-medium', 'active-low');
        buttons[i].style.backgroundColor = 'white';
        buttons[i].style.color = 'black';
        switch (buttons[i].id) {
            case 'urgent':
                img.src = '/assets/icons/Board-icons/urgent-red.svg';
                break;
            case 'medium':
                img.src = '/assets/icons/Board-icons/medium-orange.svg';
                break;
            case 'low':
                img.src = '/assets/icons/Board-icons/low-green.svg';
                break;
        }
    }
    button.classList.add(`active-${button.id}`);
    const priorityColors = {
        urgent: '#FF3D00',
        medium: '#FFA800',
        low: '#7AE229'
    };
    button.style.backgroundColor = priorityColors[button.id];
    button.style.color = 'white';
    const activeImg = button.querySelector('img');
    switch (button.id) {
        case 'urgent':
            activeImg.src = '/assets/icons/Board-icons/urgent-white.svg';
            break;
        case 'medium':
            activeImg.src = '/assets/icons/Board-icons/medium-white.svg';
            break;
        case 'low':
            activeImg.src = '/assets/icons/Board-icons/low-white.svg';
            break;
    }
}







