// GREETING FUNCTION
function getGreetingTime() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
        return "Good Morning";
    } else if (hour >= 12 && hour < 18) {
        return "Good Afternoon";
    } else if (hour >= 18 && hour < 23) {
        return "Good Evening";
    } else {
        return "Good Night";
    }
}

document.getElementById('greet-time').innerText = getGreetingTime();

// Get the active user from localStorage and update the greeting
function updateGreeting() {
    const user = JSON.parse(localStorage.getItem('activeUser'));
    const greetUserElement = document.getElementById('greet-user');

    if (user && user.fullName) {
        greetUserElement.innerText = user.fullName;
    } else {
        greetUserElement.innerText = 'Guest';
    }
}

updateGreeting();

// SUMMARY COUNTERS
async function fetchTasks() {
    try {
        const rootKey = await getTasksRootKey(); // Abrufen des dynamischen Root-Schlüssels
        if (!rootKey) {
            throw new Error('Root key for tasks not found');
        }

        const response = await fetch(`${API_URL}/${rootKey}/tasks.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return {};
    }
}

async function updateSummary() {
    const data = await fetchTasks();
    if (!data || typeof data !== 'object') {
        return;
    }

    let tasks = [];
    if (Array.isArray(data)) {
        tasks = data;
    } else if (data && typeof data === 'object') {
        tasks = Object.values(data);
    }

    const toDoCount = tasks.filter(task => task && task.status === 'to-do').length;
    const doneCount = tasks.filter(task => task && task.status === 'done').length;
    const inProgressCount = tasks.filter(task => task && task.status === 'in-progress').length;
    const awaitingFeedbackCount = tasks.filter(task => task && task.status === 'awaiting-feedback').length;
    const urgentCount = tasks.filter(task => task && task.priority === 'urgent').length;
    const totalTasks = tasks.length;

    document.getElementById('to-do-amount').innerText = toDoCount;
    document.getElementById('done-amount').innerText = doneCount;
    document.getElementById('progress-amount').innerText = inProgressCount;
    document.getElementById('feedback-amount').innerText = awaitingFeedbackCount;
    document.getElementById('font-urgent-number').innerText = urgentCount;
    document.getElementById('tasks-amount').innerText = totalTasks;
}

updateSummary();
