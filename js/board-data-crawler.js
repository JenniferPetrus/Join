// Prototyp meiner Datenkrake/Schnittstelle zur Firebase
// Wenn die Id`s alle klar sind, kann ich die Daten userspezifisch
// in die Datenbank speichern oder heraus laden . Die letzten
//Anpassungen am Crawler erfolgen dann

const API_URL = "https://your-firebase-database-url.com/";

async function fetchData(userId) {
    try {
        let response = await fetch(`${API_URL}users/${userId}/tasks.json`);
        if (!response.ok) {
            throw new Error('Error fetching tasks');
        }
        let data = await response.json();
        return data ? data : [];
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function addTask(userId, task) {
    try {
        let response = await fetch(`${API_URL}users/${userId}/tasks.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        if (!response.ok) {
            throw new Error('Failed to add task');
        }
    } catch (error) {
        console.error('Error adding task:', error);
    }
}

async function updateTask(userId, taskId, task) {
    try {
        let response = await fetch(`${API_URL}users/${userId}/tasks/${taskId}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

async function deleteTask(userId, taskId) {
    try {
        let response = await fetch(`${API_URL}users/${userId}/tasks/${taskId}.json`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

async function fetchSubtasks(userId, taskId) {
    try {
        let response = await fetch(`${API_URL}users/${userId}/tasks/${taskId}/subtasks.json`);
        if (!response.ok) {
            throw new Error('Error fetching subtasks');
        }
        let data = await response.json();
        return data ? data : [];
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function addSubtask(userId, taskId, subtask) {
    try {
        let response = await fetch(`${API_URL}users/${userId}/tasks/${taskId}/subtasks.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subtask)
        });
        if (!response.ok) {
            throw new Error('Failed to add subtask');
        }
    } catch (error) {
        console.error('Error adding subtask:', error);
    }
}

async function updateSubtask(userId, taskId, subtaskId, subtask) {
    try {
        let response = await fetch(`${API_URL}users/${userId}/tasks/${taskId}/subtasks/${subtaskId}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subtask)
        });
        if (!response.ok) {
            throw new Error('Failed to update subtask');
        }
    } catch (error) {
        console.error('Error updating subtask:', error);
    }
}

async function deleteSubtask(userId, taskId, subtaskId) {
    try {
        let response = await fetch(`${API_URL}users/${userId}/tasks/${taskId}/subtasks/${subtaskId}.json`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete subtask');
        }
    } catch (error) {
        console.error('Error deleting subtask:', error);
    }
}
