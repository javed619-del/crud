$(document).ready(function () {
    const userContainer = $("#userData");
    let currentEditingUserId = null;
    let userIdToDelete = null;

    async function fetchUsers() {
        console.log("Fetching user data...");
        try {
            const response = await fetch("https://reqres.in/api/users", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error("Failed to fetch users");

            const userData = await response.json();
            console.log("User data received:", userData);

            userContainer.empty();

                if (userData && userData.data.length > 0) {
                    userData.data.forEach(user => {
                        const userCard = $(`
                            <div class="card mt-2" data-id="${user.id}">
                            <div class="card-body d-flex align-items-center">
                                <img src="${user.avatar}" alt="${user.first_name}" class="rounded-circle mr-3" width="50">
                                <div>
                                    <h6 class="mb-0 userName">${user.first_name} ${user.last_name}</h6>
                                    <p class="text-muted mb-0 userEmail">${user.email}</p>
                                </div>
                                <button class="btn btn-warning btn-sm ml-auto editUser" 
                                    data-id="${user.id}" 
                                    data-firstname="${user.first_name}" 
                                    data-lastname="${user.last_name}" 
                                    data-email="${user.email}">Edit</button>
                                <button class="btn btn-danger btn-sm ml-2 deleteUser" 
                                    data-id="${user.id}" 
                                    data-name="${user.first_name}">Delete</button>
                            </div>
                        </div>
                        `);

                        userContainer.append(userCard);
                    });
                } else {
                    userContainer.html("<p>No user data available.</p>");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                userContainer.html("<p>Failed to load user data.</p>");
            }
    }

    fetchUsers();

    $("#addUserForm").submit(function (event) {
    event.preventDefault();
    console.log("Adding new user...");

    const firstName = $("#addFirstName").val();  // Getting first name
    const lastName = $("#addLastName").val();    // Getting last name
    const email = $("#addEmail").val();          // Getting email

    if (!firstName || !lastName || !email) {
        alert("Please fill in all fields.");
        return;
    }

    fetch("https://reqres.in/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({

        first_name: firstName,  // Sending first name
        last_name: lastName,    // Sending last name
        email: email            // Sending email

        })  // Adjusted the data sent to the API
    })
        .then(response => response.json())
        .then(data => {
            console.log("User added successfully:", data);
           
            $("#addUserModal").modal("hide");

             // Open the Success Modal
            $("#successModal").modal("show");

            // Move focus to a visible button after closing modal
            //$("#addUserButton").focus();

            // Reset the form
            $("#addUserForm")[0].reset();

            // Add the new user to the UI with the correct data
            const newUserCard = $(`
                <div class="card mt-2" data-id="${data.id}">
                    <div class="card-body d-flex align-items-center">
                        <img src="image/jpeg-featured-image.jpg" alt="${data.first_name}" class="rounded-circle mr-3" width="50">
                        <div>
                            <h6 class="mb-0 userName">${firstName} ${lastName}</h6>
                            <p class="text-muted mb-0 userEmail">${email}</p> 
                        </div>
                        <button class="btn btn-warning btn-sm ml-auto editUser" data-id="${data.id}" data-firstname="${firstName}" data-lastname="${lastName}" data-email="${email}">Edit</button>
                        <button class="btn btn-danger btn-sm ml-2 deleteUser" data-id="${data.id}" data-name="${firstName} ${lastName}">Delete</button>
                    </div>
                </div>
            `);

            // Append the new user card to the user container
            $("#userData").prepend(newUserCard);  
        })
        .catch(error => console.error("Error adding user:", error));
    });

    $(document).on("click", ".editUser", function () {
    const userId = $(this).data("id"); // Get user ID
    const userCard = $(`.card[data-id='${userId}']`);

    // Get current values from UI (user card) instead of old stored values
    const fullName = userCard.find(".userName").text().trim();
    const email = userCard.find(".userEmail").text().trim();

     // Split full name into parts
    const nameParts = fullName.split(" ");
    
    // Ensure first name contains everything except the last word
    const firstName = nameParts.slice(0, -1).join(" ") || ""; // All except last word
    const lastName = nameParts.slice(-1).join(" ") || "";  // Last word as last name

    // Update the edit form fields
    $("#editFirstName").val(firstName);
    $("#editLastName").val(lastName);
    $("#editEmail").val(email);

    // Store the user ID in a global variable for updating later
    currentEditingUserId = userId;

    // Show the edit modal
    $("#editUserModal").modal("show");
});


$("#editUserForm").submit(function (event) {
    event.preventDefault();
    console.log(`Submitting edit for user ID: ${currentEditingUserId}`);

    const updatedUserData = {
        first_name: $("#editFirstName").val(),
        last_name: $("#editLastName").val(),
        email: $("#editEmail").val()
    };

    console.log("Updated user data:", updatedUserData);

    fetch(`https://reqres.in/api/users/${currentEditingUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUserData)
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Failed to update user.");
            }
        })
        .then(data => {
            console.log("User updated:", data);
            // Show success modal
                $("#updateSuccessModal").modal("show")

            // Hide the modal after updating
            $("#editUserModal").modal("hide");

            // Find the user card in the UI and update the text
            const userCard = $(`.card[data-id='${currentEditingUserId}']`);
            
            // Correcting name update
            userCard.find(".userName").text(`${data.first_name} ${data.last_name}`);
            userCard.find(".userEmail").text(data.email);

            // Update delete button's `data-name` with the new name
            userCard.find(".deleteUser").data("name", `${data.first_name}`);

        })
        .catch(error => {
            console.error("Error updating user:", error);
            alert("Failed to update user.");
        });
});

    $(document).on("click", ".deleteUser", function () {
        const userId = $(this).data("id");
        const userName = $(this).data("name");

        console.log(`Clicked delete for user: ${userName} (ID: ${userId})`);

        // Set user details in modal
        $("#userNamePlaceholder").text(userName);
        $("#confirmDeleteUser").data("id", userId); // Store user ID in delete button
        $("#confirmDeleteUser").data("userCard", $(this).closest(".card")); // Store reference to user card

        // Show the modal
        $("#deleteUserModal").modal("show");
    });

// Handle delete confirmation
$(document).on("click", "#confirmDeleteUser", function () {
    const userId = $(this).data("id");
    const userCard = $(this).data("userCard"); // Get stored user card reference

    console.log(`Confirm delete for user ID: ${userId}`);

    fetch(`https://reqres.in/api/users/${userId}`, {
     method: "DELETE",
     headers: { "Content-Type": "application/json" },
    
      })
        .then(response => {
            if (response.ok) {
                console.log(`User ID ${userId} deleted successfully.`);
                //alert("User deleted successfully!");
                $("#deleteUserModal").modal("hide"); // Close modal
                userCard.remove(); // Remove user from frontend
                // Show success modal
                $("#deleteSuccessModal").modal("show")
            } else {
                alert("Failed to delete user.");
            }
        })
        .catch(error => console.error("Error deleting user:", error));
    });
});