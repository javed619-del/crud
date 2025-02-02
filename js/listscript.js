$(document).ready(function () {
    const userContainer = $("#userData");
    let currentEditingUserId = null;

    function fetchUsers() {
        console.log("Fetching user data...");
        fetch("https://reqres.in/api/users")
            .then(response => response.json())
            .then(userData => {
                console.log("User data received:", userData);
                userContainer.empty();

                if (userData && userData.data) {
                    userData.data.forEach(user => {
                        const userCard = $(`
                            <div class="card mt-2">
                                <div class="card-body d-flex align-items-center">
                                    <img src="${user.avatar}" alt="${user.first_name}" class="rounded-circle mr-3" width="50">
                                    <div>
                                        <h6 class="mb-0">${user.first_name} ${user.last_name}</h6>
                                        <p class="text-muted mb-0">${user.email}</p>
                                    </div>
                                    <button class="btn btn-warning btn-sm ml-auto editUser" data-id="${user.id}" data-firstname="${user.first_name}" data-lastname="${user.last_name}" data-email="${user.email}">Edit</button>
                                    <button class="btn btn-danger btn-sm ml-2 deleteUser" data-id="${user.id}" data-name="${user.first_name}">Delete</button>
                                </div>
                            </div>
                        `);

                        userContainer.append(userCard);
                    });
                } else {
                    userContainer.html("<p>No user data available.</p>");
                }
            })
            .catch(error => {
                console.error("Error fetching user data:", error);
                userContainer.html("<p>Failed to load user data.</p>");
            });
    }

    fetchUsers();

    $("#addUserForm").submit(function (event) {
        event.preventDefault();
        console.log("Adding new user...");

        const userName = $("#addUserName").val();
        const userJob = $("#addUserJob").val();

        if (!userName || !userJob) {
            alert("Please fill in all fields.");
            return;
        }

        fetch("https://reqres.in/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: userName, job: userJob })
        })
            .then(response => response.json())
            .then(data => {
                console.log("User added successfully:", data);
                alert("User added successfully with ID: " + data.id);
                $("#addUserModal").modal("hide");
                
                // Move focus to a visible button after closing modal
                $("#addUserButton").focus();
                $("#addUserForm")[0].reset();
                fetchUsers();
            })
            .catch(error => console.error("Error adding user:", error));
    });

    $(document).on("click", ".editUser", function () {
        currentEditingUserId = $(this).data("id");
        $("#editFirstName").val($(this).data("firstname"));
        $("#editLastName").val($(this).data("lastname"));
        $("#editEmail").val($(this).data("email"));
        $("#editUserModal").modal("show");
    });

    $("#editUserForm").submit(function (event) {
        event.preventDefault();
        console.log(`Updating user: ${currentEditingUserId}`);

        const updatedUserData = {
            first_name: $("#editFirstName").val(),
            last_name: $("#editLastName").val(),
            email: $("#editEmail").val()
        };

        fetch(`https://reqres.in/api/users/${currentEditingUserId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUserData)
        })
            .then(response => response.json())
            .then(data => {
                console.log("User updated:", data);
                alert("User updated successfully!");
                $("#editUserModal").modal("hide");
                fetchUsers();
            })
            .catch(error => console.error("Error updating user:", error));
    });

    $(document).on("click", ".deleteUser", function () {
        const userId = $(this).data("id");
        const userName = $(this).data("name");

        if (confirm(`Are you sure you want to delete ${userName}?`)) {
            fetch(`https://reqres.in/api/users/${userId}`, { method: "DELETE" })
                .then(response => {
                    if (response.ok) {
                        alert("User deleted successfully!");
                        fetchUsers();
                    } else {
                        alert("Failed to delete user.");
                    }
                })
                .catch(error => console.error("Error deleting user:", error));
        }
    });
});