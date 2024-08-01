function setActive(element) {
    // Entfernt die Klasse 'active' von allen Elementen
    const navItems = document.getElementsByClassName('NavGap');
    for (let i = 0; i < navItems.length; i++) {
        navItems[i].classList.remove('active');
        const img = navItems[i].querySelector('img');
        if (img) {
            switch (navItems[i].textContent.trim()) {
                case 'Summary':
                    img.src = '/assets/icons/summary-icon-dark.png';
                    break;
                case 'Add Task':
                    img.src = '/assets/icons/add-task-icon.png';
                    break;
                case 'Board':
                    img.src = '/assets/icons/Board-icon.png';
                    break;
                case 'Contacts':
                    img.src = '/assets/icons/contacts-icon.png';
                    break;
            }
        }
    }

    element.classList.add('active');
    const img = element.querySelector('img');
    if (img) {
        switch (element.textContent.trim()) {
            case 'Summary':
                img.src = '/assets/icons/summary-icon-bright.png';
                break;
            case 'Add Task':
                img.src = '/assets/icons/add-task-icon-bright.png';
                break;
            case 'Board':
                img.src = '/assets/icons/Board-icon-bright.png';
                break;
            case 'Contacts':
                img.src = '/assets/icons/contacts-icon-bright.png';
                break;
        }
    }
}
