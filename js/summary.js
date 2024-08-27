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
        console.log("Root key for tasks:", rootKey); // Debugging

        if (!rootKey) {
            throw new Error('Root key for tasks not found');
        }

        const response = await fetch(`${API_URL}/${rootKey}/tasks.json`);
        console.log("Firebase response status:", response.status); // Debugging

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched tasks data:", data); // Debugging

        if (!data) {
            console.error('No data found in the database.');
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return null;
    }
}

function getNextDueDate(urgentTasks) {
    if (!urgentTasks || urgentTasks.length === 0) {
        return null;
    }

    const dueDates = urgentTasks
        .map(task => new Date(task.dueDate))
        .filter(date => !isNaN(date.getTime())); 

    if (dueDates.length === 0) {
        return null;
    }

    const nearestDueDate = new Date(Math.min(...dueDates));
    return nearestDueDate.toLocaleDateString();
}

async function updateSummary() {
    const data = await fetchTasks();
    if (!data || typeof data !== 'object') {
        console.error('Invalid data structure received:', data); // Debugging
        return;
    }

    let tasks = [];
    if (Array.isArray(data)) {
        tasks = data;
    } else if (data && typeof data === 'object') {
        tasks = Object.values(data);
    }

    console.log("Tasks array:", tasks); // Debugging

    const toDoCount = tasks.filter(task => task && task.status === 'to-do').length;
    const doneCount = tasks.filter(task => task && task.status === 'done').length;
    const inProgressCount = tasks.filter(task => task && task.status === 'in-progress').length;
    const awaitingFeedbackCount = tasks.filter(task => task && task.status === 'awaiting-feedback').length;
    const urgentTasks = tasks.filter(task => task && task.priority === 'urgent');
    const urgentCount = urgentTasks.length;
    const totalTasks = tasks.length;

    document.getElementById('to-do-amount').innerText = toDoCount;
    document.getElementById('done-amount').innerText = doneCount;
    document.getElementById('progress-amount').innerText = inProgressCount;
    document.getElementById('feedback-amount').innerText = awaitingFeedbackCount;
    document.getElementById('font-urgent-number').innerText = urgentCount;
    document.getElementById('tasks-amount').innerText = totalTasks;

    const nextDueDate = getNextDueDate(urgentTasks);
    document.getElementById('deadline-date').innerText = nextDueDate ? nextDueDate : 'No Upcoming Deadline';

    console.log("Summary updated successfully");
}

updateSummary();