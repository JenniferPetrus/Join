// Hilfsdatei zum Anlegen vom Guest-User. Verlinken in Contacts.html und in der Console mit "createGuestUser();"  ausführen


function createGuestUser() {
    let guestUser = {
        id: "1",
        fullName: "Guest User",
        email: "guest@guest.com",
        password: "guest123",
        role: "guest",
        linkedContacts: "all"
    };

    fetch(`${API_URL}/3.json`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(guestUser)
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error("Failed to create guest user");
        }
        console.log("Guest user created successfully");
    })
    .catch(function(error) {
        console.error("Error creating guest user:", error);
    });
}
