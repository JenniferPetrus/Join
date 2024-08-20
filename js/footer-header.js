const colors = [
    '#A8A8A8', '#D1D1D1', '#CDCDCD', '#007CEE', '#FF7A00', '#FF5EB3',
    '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E',
    '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'
];

function setActive(element) {
    const navItems = document.getElementsByClassName('NavGap');
    for (let i = 0; i < navItems.length; i++) {
        navItems[i].classList.remove('active');
        const img = navItems[i].querySelector('img');
        if (img) {
            switch (navItems[i].textContent.trim()) {
                case 'Summary':
                    img.src = './assets/icons/summary-icon-dark.png';
                    break;
                case 'Add Task':
                    img.src = './assets/icons/add-task-icon.png';
                    break;
                case 'Board':
                    img.src = './assets/icons/Board-icon.png';
                    break;
                case 'Contacts':
                    img.src = './assets/icons/contacts-icon.png';
                    break;
            }
        }
    }

    element.classList.add('active');
    const img = element.querySelector('img');
    if (img) {
        switch (element.textContent.trim()) {
            case 'Summary':
                img.src = './assets/icons/summary-icon-bright.png';
                break;
            case 'Add Task':
                img.src = './assets/icons/add-task-icon-bright.png';
                break;
            case 'Board':
                img.src = './assets/icons/Board-bright.png';
                break;
            case 'Contacts':
                img.src = './assets/icons/contacts-icon-bright.png';
                break;
        }
    }
}

function waitForUserElementAndLoad() {
    const userElement = document.getElementById('user');
    if (userElement) {
        loadActiveUser();  
    } else {
        setTimeout(waitForUserElementAndLoad, 100);  
    }
}

function loadActiveUser() {
    const user = JSON.parse(localStorage.getItem('activeUser'));
    const userElement = document.getElementById('user');

    if (user && user.fullName !== 'Guest') {
        displayUserInHeader(user);
    } else {
        userElement.innerText = 'G';  
        userElement.style.backgroundColor = '';  
    }
}

function getInitials(fullName) {
    let nameParts = fullName.split(' ');
    let initials = '';
    for (let i = 0; i < nameParts.length && initials.length < 2; i++) {
        initials += nameParts[i].charAt(0).toUpperCase();
    }
    return initials;
}

function displayUserInHeader(user) {
    const userElement = document.getElementById('user');
    const initials = getInitials(user.fullName);
    const color = user.color || getRandomColor();

    userElement.innerText = initials;
    userElement.style.backgroundColor = color;
}

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

document.addEventListener('DOMContentLoaded', waitForUserElementAndLoad);
