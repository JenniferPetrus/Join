// Initialisiere das Skript, sobald der HTML-Inhalt vollständig geladen ist
includeHTML(function() {
    console.log('Footer fully loaded, initializing navigation...');
    
    const navbarContent = document.querySelector('#Navbar');
    if (navbarContent) {
        console.log('Loaded Navbar content:', navbarContent.innerHTML);

        // Setze die Markierung basierend auf der aktuellen URL
        highlightActiveLink();
    } else {
        console.log('Navbar content not found!');
    }
});

// Funktion zur Hervorhebung des aktiven Links basierend auf der aktuellen URL
function highlightActiveLink() {
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);

    const navItems = document.querySelectorAll('#NavLeft .NavGap');
    console.log('NavGap items found:', navItems.length);

    navItems.forEach(function(item) {
        const itemPath = new URL(item.href).pathname;

        // Setze das aktive Element basierend auf der aktuellen URL
        if (itemPath === currentPath) {
            // Aktiviere das Element und setze das Icon
            item.classList.add('active');
            updateIcon(item, true);
        } else {
            // Deaktiviere alle anderen Elemente und setze die Icons zurück
            item.classList.remove('active');
            updateIcon(item, false);
        }
    });
}

// Funktion zum Aktualisieren des Icons basierend auf dem Aktivitätsstatus
function updateIcon(element, isActive) {
    const img = element.querySelector('img');
    if (img) {
        switch (element.textContent.trim()) {
            case 'Summary':
                img.src = isActive ? './assets/icons/summary-icon-bright.png' : './assets/icons/summary-icon-dark.png';
                break;
            case 'Add Task':
                img.src = isActive ? './assets/icons/add-task-icon-bright.png' : './assets/icons/add-task-icon.png';
                break;
            case 'Board':
                img.src = isActive ? './assets/icons/Board-icon-bright.png' : './assets/icons/Board-icon.png';
                break;
            case 'Contacts':
                img.src = isActive ? './assets/icons/contacts-icon-bright.png' : './assets/icons/contacts-icon.png';
                break;
        }
    }
}
