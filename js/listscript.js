$(document).ready(function () {
    const userContainer = $("#userData");
    let currentEditingUserId = null;
    let userIdToDelete = null;
    let currentPage = 1;  // Track current page (1 or 2)

    // Show the loading indicator
    $("#loadingIndicator").show();

    async function fetchUsers() {
        console.log("Fetching user data...");
        try {
            const responsePage1  = await fetch("https://reqres.in/api/users?delay=3", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

             const responsePage2 = await fetch("https://reqres.in/api/users?page=2", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            const userDataPage1 = await responsePage1.json();
            const userDataPage2 = await responsePage2.json();

            console.log("User data received:", userDataPage1, userDataPage2);

            // Check if the 'data' property exists in the response
            const usersPage1 = userDataPage1.data || [];
            const usersPage2 = userDataPage2.data || [];

            // Combine data from both pages
            const combinedUserData = { page1: usersPage1, page2: usersPage2 };

            // Function to render users on the current page
            function renderPageData() {
            userContainer.empty();

            let dataToRender = currentPage === 1 ? combinedUserData.page1 : combinedUserData.page2;

                if (dataToRender.length > 0) {
                    dataToRender.forEach(user => {
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
            } 

             // Render page 1 data initially
            renderPageData();

            // Handle page switching
            $("#page1Btn").click(function () {
                currentPage = 1;
                renderPageData();
            });

            $("#page2Btn").click(function () {
                currentPage = 2;
                renderPageData();
            });

        } catch (error) {
            console.error("Error fetching user data:", error);
            userContainer.html("<p>Failed to load user data.</p>");
        } finally {
            // Hide the loading indicator after the data is loaded or failed
            $("#loadingIndicator").hide();
        }
    }
    fetchUsers();

    $('#addUserModal').on('hidden.bs.modal', function (e) {
    $(this)
        
        .find("#imagePreview")
        .attr("src", '')
        .hide(); // Hide the image preview when the modal closes
        console.log("Modal closed:", e.target.id); // Logs 'addUserModal'
    });

     // Image preview function
    $("#addProfilePic").change(function (event) {
        let input = event.target;
        if (input.files && input.files[0]) {
            let reader = new FileReader();
            reader.onload = function () {
                $("#imagePreview").attr("src", reader.result).show(); // Show the preview image
            };
            reader.readAsDataURL(input.files[0]);
        }
    });

    $("#addUserForm").submit(async function (event) {
    event.preventDefault();
    console.log("Adding new user...");

    const firstName = $("#addFirstName").val();  // Getting first name
    const lastName = $("#addLastName").val();    // Getting last name
    const email = $("#addEmail").val();          // Getting email
    const fileInput = $("#addProfilePic")[0].files[0];

    if (!firstName || !lastName || !email) {
        alert("Please fill in all fields.");
        return;
    }

    // Function to send user data after getting profile pic URL (if any)
    function sendUserData(profilePicUrl = "") {
        const userData = {
            first_name: firstName,
            last_name: lastName,
            email: email
        };

        if (profilePicUrl) {
            userData.profile_picture = profilePicUrl;  // Only add if uploaded
        }

    fetch("https://reqres.in/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({

        first_name: firstName,  // Sending first name
        last_name: lastName,    // Sending last name
        email: email,            // Sending email
        //profile_picture: profilePicUrl // Send uploaded image URL

        })  // Adjusted the data sent to the API
    })
        .then(response => response.json())
        .then(data => {
            console.log("User added successfully:", data);
           
            $("#addUserModal").modal("hide");

             // Open the Success Modal
            $("#successModal").modal("show");

            // Reset the form
            $("#addUserForm")[0].reset();

            // Add the new user to the UI with the correct data
            const newUserCard = $(`
                <div class="card mt-2" data-id="${data.id}">
                    <div class="card-body d-flex align-items-center">
                        ${profilePicUrl ? `<img src="${profilePicUrl}" alt="${firstName}" class="rounded-circle mr-3" width="50">` : ""}
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
    }

    // If no file is uploaded, send user data without profile picture
    if (!fileInput) {
        sendUserData();
    } else {
        // Upload profile picture
        const formData = new FormData();
        formData.append("file", fileInput);

        fetch("https://api.escuelajs.co/api/v1/files/upload", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            sendUserData(data.location);  // Send user data with uploaded profile pic
        })
        .catch(error => {
            console.error("Error uploading profile picture:", error);
            sendUserData();  // Fallback: Send user data without profile pic
        });
    }
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
    const firstName = nameParts.slice(0,nameParts.length -1).join(" "); // All except last word
    const lastName = nameParts.slice(nameParts.length -1).join(" ");  // Last word as last name

    // Update the edit form fields
    $("#editFirstName").val(firstName);
    $("#editLastName").val(lastName);
    $("#editEmail").val(email);

    // Store the user ID in a global variable for updating later
    currentEditingUserId = userId;

    // Show the edit modal
    $("#editUserModal").modal("show");
});

    // Handle Form Submission for Editing User
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
                if (!response.ok) throw new Error("Failed to update user.");
                return response.json();
            })
            .then(data => {
                console.log("User updated:", data);

                // Show success modal
                $("#updateSuccessModal").modal("show");

                // Hide edit modal
                $("#editUserModal").modal("hide");

                // Update user card in UI
                const userCard = $(`.card[data-id='${currentEditingUserId}']`);
                userCard.find(".userName").text(`${data.first_name} ${data.last_name}`);
                userCard.find(".userEmail").text(data.email);

                // Update delete button's `data-name` with new name
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

