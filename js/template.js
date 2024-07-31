function includeHTML() {
  const elements = document.querySelectorAll('[w3-include-html]');
  const requests = [];

  elements.forEach((element) => {
    const file = element.getAttribute('w3-include-html');
    if (file) {
      // Add fetch request to the list
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

  // Wait for all fetch requests to complete
  Promise.all(requests).then(() => {
    // If there are more elements added dynamically, call includeHTML again
    if (document.querySelector('[w3-include-html]')) {
      includeHTML();
    }
  });
}