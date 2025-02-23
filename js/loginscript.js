document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault(); // Prevent form from submitting normally

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log("Email:", email);
  console.log("Password:", password);

  const validEmail = "eve.holt@reqres.in";
  const validPassword = "cityslicka";

  // Hide previous messages
  document.getElementById('loginMessage').style.display = 'none';
  document.getElementById('loginSuccessMessage').style.display = 'none';
  document.getElementById('loginFailedMessage').style.display = 'none';

  // Check if the email is correct but the password is wrong
  if (email === validEmail && password !== validPassword) {
    console.error("The password does not match.");
    document.getElementById('loginMessage').style.display = 'block';
    document.getElementById('loginFailedMessage').style.display = 'block';
    document.getElementById('loginFailedMessage').innerText = "The password does not match.";
    return;
  }

  // Check if the email or password is incorrect
  if (email !== validEmail || password !== validPassword) {
    console.error("Invalid credentials.");
    document.getElementById('loginMessage').style.display = 'block';
    document.getElementById('loginFailedMessage').style.display = 'block';
    document.getElementById('loginFailedMessage').innerText = "Login Failed! Please check your credentials.";
    return;
  }

  // Prepare data for the login request
  const loginData = { email, password };

  fetch('https://reqres.in/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.token) {
      console.log('Login successful:', data);

      // Display success message
      document.getElementById('loginMessage').style.display = 'block';
      document.getElementById('loginSuccessMessage').style.display = 'block';

      // Fetch API data after successful login
      return fetch('https://reqres.in/api/users?delay=3', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}` // Simulating token usage
        }
      });
    } else {
      throw new Error('Invalid credentials');
    }
  })
  .then(response => response.json())
  .then(userData => {
    console.log('User data from API:', userData);

    // Store user data and redirect
    localStorage.setItem('userData', JSON.stringify(userData));
    window.location.href = 'list.html';
  })
  .catch(error => {
    console.error('Error:', error);
    document.getElementById('loginMessage').style.display = 'block';
    document.getElementById('loginFailedMessage').style.display = 'block';
    document.getElementById('loginFailedMessage').innerText = "An error occurred. Please try again.";
  });
});


 // Register Form Submission
        document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    console.log("Register Form Submitted");
    console.log("Entered Email:", email);
    console.log("Entered Password:", password || "No password entered");

    // Hide previous messages
    document.getElementById('registerMessage').style.display = 'none';
    document.getElementById('registerSuccessMessage').style.display = 'none';
    document.getElementById('registerFailedMessage').style.display = 'none';

    fetch('https://reqres.in/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data }))) // Get response status & body
    .then(({ status, body }) => {
        console.log("Response Status:", status);
        console.log("Response Body:", body);

        if (status === 200 && body.id) {
            console.log("Registration Successful! User ID:", body.id);
            document.getElementById('registerMessage').style.display = 'block';
            document.getElementById('registerSuccessMessage').style.display = 'block';
        } else if (status === 400 && body.error === "Missing password") {
            console.error("Error: Missing password");
            document.getElementById('registerMessage').style.display = 'block';
            document.getElementById('registerFailedMessage').style.display = 'block';
            document.getElementById('registerFailedMessage').innerText = "Missing password";
        } else {
            throw new Error("Registration Failed! Please try again.");
        }
    })
    .catch(error => {
        console.error("Registration Error:", error.message);
        document.getElementById('registerMessage').style.display = 'block';
        document.getElementById('registerFailedMessage').style.display = 'block';
        document.getElementById('registerFailedMessage').innerText = error.message;
    });
});
