const API_URL = "https://join-d67a5-default-rtdb.europe-west1.firebasedatabase.app/";
let dbExchange = [];

// Dynamische Funktion zum Laden von Daten (User oder Tasks)
async function loadData(dataType, userId = null) {
    try {
        let data;
        if (dataType === 'users') {
            data = await fetchUsers();
        } else if (dataType === 'tasks' && userId) {
            data = await fetchTasks(userId);
        } else {
            throw new Error('Invalid data type or missing userId for tasks');
        }
        dbExchange = data;
        console.log(`${dataType} data loaded into dbExchange:`, dbExchange);
    } catch (error) {
        console.error(`Error loading ${dataType} data:`, error);
    }
}

// Dynamische Funktion zum Bearbeiten von Daten (User oder Tasks)
async function editData(dataType, userId, data, taskId = null) {
    try {
        if (dataType === 'users') {
            await updateUser(userId, data);
        } else if (dataType === 'tasks' && taskId) {
            await updateTask(userId, taskId, data);
        } else {
            throw new Error('Invalid data type or missing taskId for tasks');
        }
        await loadData(dataType, userId); // Neu laden, um dbExchange zu aktualisieren
        console.log(`${dataType} data edited and reloaded into dbExchange`);
    } catch (error) {
        console.error(`Error editing ${dataType} data:`, error);
    }
}

// Dynamische Funktion zum Löschen von Daten (User oder Tasks)
async function deleteData(dataType, userId, taskId = null) {
    try {
        if (dataType === 'users') {
            await deleteUser(userId);
            dbExchange = []; // dbExchange zurücksetzen
        } else if (dataType === 'tasks' && taskId) {
            await deleteTask(userId, taskId);
            await loadData('tasks', userId); // Neu laden, um dbExchange zu aktualisieren
        } else {
            throw new Error('Invalid data type or missing taskId for tasks');
        }
        console.log(`${dataType} data deleted and dbExchange updated`);
    } catch (error) {
        console.error(`Error deleting ${dataType} data:`, error);
    }
}

// Hilfsfunktion zum Laden von Benutzerdaten
async function fetchUsers() {
    try {
        let response = await fetch(`${API_URL}1/users.json`);
        if (!response.ok) {
            throw new Error('Error fetching users');
        }
        let data = await response.json();
        let users = [];
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                users.push({ id: key, ...data[key] });
            }
        }
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

// Hilfsfunktion zum Bearbeiten von Benutzerdaten
async function updateUser(userId, data) {
    try {
        let response = await fetch(`${API_URL}1/users/${userId}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error('Failed to update user data');
        }
        console.log(`User data updated for ID: ${userId}`);
    } catch (error) {
        console.error('Error updating user data:', error);
    }
}

// Hilfsfunktion zum Löschen von Benutzerdaten
async function deleteUser(userId) {
    try {
        let response = await fetch(`${API_URL}1/users/${userId}.json`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete user data');
        }
        console.log(`User data deleted for ID: ${userId}`);
    } catch (error) {
        console.error('Error deleting user data:', error);
    }
}

// Hilfsfunktion zum Laden von Aufgaben
// Hilfsfunktion zum Laden von Aufgaben
async function fetchTasks(userId, taskId = null) {
    try {
        let url = taskId 
            ? `${API_URL}1/users/${userId}/tasks/${taskId}.json` 
            : `${API_URL}1/users/${userId}/tasks.json`;

        let response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error fetching tasks');
        }
        let data = await response.json();
        return data ? (taskId ? data : Object.keys(data).map(key => ({ id: key, ...data[key] }))) : [];
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}


// Hilfsfunktion zum Bearbeiten von Aufgaben
async function updateTask(userId, taskId, task) {
    try {
        let response = await fetch(`${API_URL}1/users/${userId}/tasks/${taskId}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        });
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        console.log(`Task updated for ID: ${taskId}`);
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

// Hilfsfunktion zum Löschen von Aufgaben
async function deleteTask(userId, taskId) {
    try {
        let response = await fetch(`${API_URL}1/users/${userId}/tasks/${taskId}.json`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        console.log(`Task deleted for ID: ${taskId}`);
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}
