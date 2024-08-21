document.addEventListener('DOMContentLoaded', () => {
    function addEventListenersToPlusIcons() {
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
                addEventListenersToPlusIcons();
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
    addEventListenersToPlusIcons();
});
