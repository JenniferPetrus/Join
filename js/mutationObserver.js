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

                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Prüfen, ob der Footer hinzugefügt wurde
                        if (node.querySelector && node.querySelector('#NavLeft')) {
                            console.log('Footer wurde hinzugefügt. Navigation wird markiert.');
                            markActiveLink();
                        }

                        // Überprüfen, ob die speziellen Container hinzugefügt wurden
                        if (['todo', 'in-progress', 'await-feedback', 'done'].includes(node.id)) {
                            console.log(`Container '${node.id}' wurde hinzugefügt.`);
                            // Lade Aufgaben nur, wenn sie noch nicht geladen wurden
                            if (!node.hasAttribute('data-tasks-loaded')) {
                                loadTasksFromDatabase(); 
                                node.setAttribute('data-tasks-loaded', 'true');
                            }
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

function markActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'summary.html'; 
    console.log('Current page:', currentPage);

    const navLinks = document.querySelectorAll('#NavLeft .NavGap'); 

    if (navLinks.length === 0) {
        console.error("No navigation links found!");
        return;  
    }

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop() || 'summary.html';
        console.log(`Comparing: ${linkPage} with ${currentPage}`);

        if (linkPage === currentPage) {
            link.classList.add('active');  
            console.log(`Set active class for: ${link.href}`);
        } else {
            link.classList.remove('active');  
            console.log(`Removed active class for: ${link.href}`);
        }
    });
}

document.addEventListener('DOMContentLoaded', setupMutationObserver);

includeHTML(function() {
    console.log('Footer fully loaded, initializing navigation...');
    markActiveLink();
});
