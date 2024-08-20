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
    }
});
}
// Rufe die includeHTML-Funktion auf und initialisiere die Navigation erst nach dem Laden des Footers
includeHTML(function() {
  console.log('Footer fully loaded, initializing navigation...');

  const navItems = document.querySelectorAll('.NavGap a');
  console.log('NavGap items found after loading:', navItems.length);

  navItems.forEach(function(element) {
      element.addEventListener('click', function(event) {
          console.log('Nav item clicked:', event.currentTarget.href);
          localStorage.setItem('testNavItem', event.currentTarget.href);
          console.log('Stored in localStorage:', event.currentTarget.href);
      });
  });

  const storedNavItem = localStorage.getItem('testNavItem');
  console.log('Retrieved from localStorage:', storedNavItem);
});