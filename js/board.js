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
// Plus-Icon Hover Change Colour
document.querySelectorAll('.plus-icon').forEach(function(icon) {
    icon.addEventListener('mouseover', function() {
        this.src = './assets/icons/Board-icons/plus icon blue.svg';
    });
    icon.addEventListener('mouseout', function() {
        this.src = './assets/icons/Board-icons/plus icon black.svg';
    });
});
// Search Icon Hover Change COlour
let searchIcon = document.querySelector('.vector-input-search-item');

searchIcon.addEventListener('mouseover', function() {
    this.src = './assets/icons/Board-icons/search icon blue.svg';
});

searchIcon.addEventListener('mouseout', function() {
    this.src = './assets/icons/Board-icons/search icon black.svg';
});
