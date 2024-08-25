function setupMutationObserver() {
    const targetNode = document.body;
    const config = {
        childList: true,
        subtree: true,
        attributes: false
    };

    const callback = function(mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                console.log('DOM-Änderung erkannt: Kindknoten hinzugefügt oder entfernt.');

                // Überprüfe, ob der Footer hinzugefügt wurde
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Prüfen, ob der Footer hinzugefügt wurde
                        if (node.querySelector && node.querySelector('#NavLeft')) {
                            console.log('Footer wurde hinzugefügt. Navigation wird markiert.');
                            markActiveLink();  // Markiere die Navigationselemente
                        }

                        // Überprüfe, ob die speziellen Container hinzugefügt wurden
                        if (['todo', 'in-progress', 'await-feedback', 'done'].includes(node.id)) {
                            console.log(`Container '${node.id}' wurde hinzugefügt.`);
                            loadTasksFromDatabase(); // Lädt die Aufgaben, wenn der Container bereit ist
                            rebindEventListeners();  // Sicherstellen, dass Event-Listener gebunden werden
                        }
                    }
                });
            }
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
    console.log('MutationObserver eingerichtet und aktiv.');
}

// Funktion zum Markieren des aktiven Links
function markActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'summary.html';  // Falls root, setze default 'summary.html'
    console.log('Current page:', currentPage);  // Debugging

    const navLinks = document.querySelectorAll('#NavLeft .NavGap'); // Wähle die Links direkt aus

    if (navLinks.length === 0) {
        console.error("No navigation links found!");
        return;  // Beende die Funktion, wenn keine Links gefunden werden
    }

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop() || 'summary.html';
        console.log(`Comparing: ${linkPage} with ${currentPage}`);  // Debugging

        if (linkPage === currentPage) {
            link.classList.add('active');  // Setze die aktive Klasse direkt auf den Link
            console.log(`Set active class for: ${link.href}`);
        } else {
            link.classList.remove('active');  // Entferne die aktive Klasse
            console.log(`Removed active class for: ${link.href}`);
        }
    });
}

// MutationObserver nach dem Laden des DOMs einrichten
document.addEventListener('DOMContentLoaded', setupMutationObserver);

// Rufe die includeHTML-Funktion auf und initialisiere die Navigation erst nach dem Laden des Footers
includeHTML(function() {
    console.log('Footer fully loaded, initializing navigation...');
    markActiveLink();  // Fallback-Funktion zur Markierung der Navigation
});
