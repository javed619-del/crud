document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault(); // Prevent form from submitting normally

  // Get the email and password input values
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

   // Log email and password to the console
  console.log("Email:", email);
  console.log("Password:", password);

  // Expected credentials
  const validEmail = "eve.holt@reqres.in";
  const validPassword = "cityslicka";

  // Hide previous messages
  document.getElementById('loginMessage').style.display = 'none';
  document.getElementById('loginSuccessMessage').style.display = 'none';
  document.getElementById('loginFailedMessage').style.display = 'none';

  // Check email and password before making the API call
  if (email === validEmail && password !== validPassword) {
    console.error("The password does not match.");
    document.getElementById('loginMessage').style.display = 'block';
    document.getElementById('loginFailedMessage').style.display = 'block';
    document.getElementById('loginFailedMessage').innerText = "The password does not match.";
    return;
  }

  // Prepare data for the login request
  const loginData = {
    email: email,
    password: password
  };

  // Make the API call
  fetch('https://reqres.in/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(loginData)
  })
  .then(response => response.json())
  .then(data => {
    // Hide the login messages initially
    document.getElementById('loginSuccessMessage').style.display = 'none';
    document.getElementById('loginFailedMessage').style.display = 'none';

    if (data.token) {
      console.log('Login successful:', data);

       // Now, fetch the /api/users?delay=3 data after successful login
      return fetch('https://reqres.in/api/users?delay=3');
      
      // Display the success message and token
      document.getElementById('loginMessage').style.display = 'block';
      document.getElementById('loginSuccessMessage').style.display = 'block';

    } else {
      console.error('Login failed:', data);
      
      // Display the failed login message
      document.getElementById('loginMessage').style.display = 'block';
      document.getElementById('loginFailedMessage').style.display = 'block';
      document.getElementById('loginFailedMessage').innerText = "Invalid credentials.";
      throw new Error('Invalid credentials');

    }
  })

  .then(response => response.json())
  .then(userData => {
    // You can redirect to a new page and display the API response
    console.log('User data from API:', userData);

    // Optionally, you can redirect to another page and pass the data through localStorage or sessionStorage
    localStorage.setItem('userData', JSON.stringify(userData));

    // Redirect to a new page (change the URL to your desired page)
    window.location.href = 'list.html'; // Change to the page you want
  })

  .catch(error => {
    console.error('Error:', error);
    
    // Display the failed login message in case of error
    document.getElementById('loginMessage').style.display = 'block';
    document.getElementById('loginFailedMessage').style.display = 'block';
    document.getElementById('loginFailedMessage').innerText = "An error occurred. Please try again.";
  });


});
