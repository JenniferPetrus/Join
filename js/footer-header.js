includeHTML(function() {
    console.log('Footer fully loaded, initializing navigation...');

    const navbarContent = document.querySelector('#Navbar');
    if (navbarContent) {
        console.log('Loaded Navbar content:', navbarContent.innerHTML);

        const navItems = document.querySelectorAll('#NavLeft .NavGap');
        console.log('NavGap items found after loading:', navItems.length);

        // Setze die Markierung basierend auf der aktuellen URL
        const currentPath = window.location.pathname;
        console.log('Current path:', currentPath);

        navItems.forEach(function(item) {
            const itemPath = new URL(item.href).pathname;

            // Setze das aktive Element basierend auf der aktuellen URL
            if (itemPath === currentPath) {
                setActive(item);
            } else {
                resetIcon(item);  // Setze alle anderen Icons auf inaktiv
            }

            // Klick-Listener für jeden Navigationseintrag
            item.addEventListener('click', function(event) {
                console.log('Nav item clicked:', event.currentTarget.href);
                // Setze das aktive Element und aktualisiere die Icons
                setActive(item);
            });
        });
    } else {
        console.log('Navbar content not found!');
    }
});

function setActive(element) {
    console.log(`Setting active for element: ${element}`);
    const navItems = document.getElementsByClassName('NavGap');

    // Setze alle Icons zurück und entferne die aktive Klasse
    for (let i = 0; i < navItems.length; i++) {
        navItems[i].classList.remove('active');
        resetIcon(navItems[i]);  // Stelle sicher, dass nicht aktive Icons auf inaktiv gesetzt werden
    }

    // Setze das aktuelle Element auf aktiv und aktualisiere das Icon
    element.classList.add('active');
    updateIcon(element, true);  // Setze das Icon auf den aktiven Zustand
}

function resetIcon(element) {
    // Setzt die Icons auf den inaktiven Zustand zurück
    updateIcon(element, false);
}

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
