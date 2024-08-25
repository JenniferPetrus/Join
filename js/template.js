function includeHTML(callback) {
    const elements = document.querySelectorAll('[w3-include-html]');
    const requests = [];

    elements.forEach((element) => {
        const file = element.getAttribute('w3-include-html');
        if (file) {
            requests.push(
                fetch(file)
                    .then((response) => {
                        if (!response.ok) throw new Error("Page not found.");
                        return response.text();
                    })
                    .then((data) => {
                        element.innerHTML = data;
                        element.removeAttribute('w3-include-html');
                    })
                    .catch((error) => {
                        element.innerHTML = error.message;
                        element.removeAttribute('w3-include-html');
                    })
            );
        }
    });

    Promise.all(requests).then(() => {
        if (document.querySelector('[w3-include-html]')) {
            includeHTML(callback); // Wenn mehr Elemente geladen werden müssen, rufe die Funktion erneut auf
        } else if (callback) {
            console.log('All HTML content loaded.'); // Debugging-Log
            callback(); // Callback nach vollständigem Laden des Inhalts ausführen

            // Navigation markieren, nachdem der Footer geladen ist
            markActiveLink();
        }
    });
}

// Funktion zum Markieren des aktiven Links
function markActiveLink() {
    // Hole den aktuellen Dateinamen der Seite ohne Verzeichnispfade und ohne Query-Parameter/Hash
    const currentPage = window.location.pathname.split('/').pop() || 'summary.html';  // Falls root, setze default 'summary.html'

    console.log('Current page:', currentPage);  // Debugging

    // Wähle alle Links im Footer aus
    const navLinks = document.querySelectorAll('#NavLeft .NavGap'); // Wähle die Links direkt aus

    if (navLinks.length === 0) {
        console.error("No navigation links found!");
        return;  // Beende die Funktion, wenn keine Links gefunden werden
    }

    navLinks.forEach(link => {
        // Hole den Dateinamen aus dem href-Attribut des Links, ohne Verzeichnispfade und ohne Query-Parameter/Hash
        const linkPage = link.getAttribute('href').split('/').pop() || 'summary.html';

        console.log(`Comparing: ${linkPage} with ${currentPage}`);  // Debugging

        // Vergleiche den Link-Dateinamen mit dem aktuellen Seitennamen
        if (linkPage === currentPage) {
            link.classList.add('active');  // Setze die aktive Klasse direkt auf den Link
            console.log(`Set active class for: ${link.href}`);
        } else {
            link.classList.remove('active');  // Entferne die aktive Klasse
            console.log(`Removed active class for: ${link.href}`);
        }
    });
}

// Rufe die includeHTML-Funktion auf und initialisiere die Navigation erst nach dem Laden des Footers
includeHTML(function() {
    console.log('Footer fully loaded, initializing navigation...');
    markActiveLink();  // Rufe die Funktion zur Markierung der Navigation auf
});
