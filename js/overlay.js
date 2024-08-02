document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    setupAddContactButton();
}

function setupAddContactButton() {
    const addContactButton = document.querySelector('.add-contact-btn');
    if (addContactButton) {
        addContactButton.addEventListener('click', loadOverlay);
    } else {
        console.error('Add contact button not found');
    }
}

function loadOverlay() {
    fetch('overlay.html')
        .then(response => response.text())
        .then(displayOverlay)
        .catch(handleError);
}

function displayOverlay(html) {
    const overlayContainer = document.getElementById('overlay-container');
    overlayContainer.innerHTML = html;
    showOverlay();
    setupCloseButton();
    setupBackgroundClick();
    setupCancelButton(); 
}

function showOverlay() {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.classList.remove('hide');
        overlay.classList.add('show');
    } else {
        console.error('Overlay element not found');
    }
}

function setupCloseButton() {
    const closeButton = document.getElementById('overlay-close-btn');
    if (closeButton) {
        closeButton.addEventListener('click', closeOverlay);
    } else {
        console.error('Close button not found');
    }
}

function setupBackgroundClick() {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.addEventListener('click', function(event) {
            if (event.target === overlay) {
                closeOverlay();
            }
        });
    } else {
        console.error('Overlay element not found');
    }
}

function setupCancelButton() {
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
        cancelButton.addEventListener('click', closeOverlay);
    } else {
        console.error('Cancel button not found');
    }
}

function clearInputFields() {
    const inputFields = document.querySelectorAll('.styled-input');
    inputFields.forEach(input => {
        input.value = '';
    });
}

function closeOverlay() {
    const overlay = document.querySelector('.overlay');
    if (overlay) {
        overlay.classList.remove('show');
        overlay.classList.add('hide');
        setTimeout(clearOverlayContent, 500);
    }
}

function clearOverlayContent() {
    const overlayContainer = document.getElementById('overlay-container');
    if (overlayContainer) {
        overlayContainer.innerHTML = '';
    }
}

function handleError(error) {
    console.error('Error loading overlay:', error);
}
