function loadOverlay() {
    fetch('./board-overlays.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('overlay-container').innerHTML = data;
        })
        .catch(error => console.error('Error loading the overlay:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    const addTaskButton = document.querySelector('.add-task-button');
    if (addTaskButton) {
        addTaskButton.addEventListener('click', () => {
            loadOverlay();
            document.getElementById('addTaskOverlay').style.display = 'flex';
        });
    }
});
