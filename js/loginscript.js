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

  // Check if entered email & password match the expected credentials
  if (email !== validEmail || password !== validPassword) {
    console.error("Invalid credentials.");
    document.getElementById('loginMessage').style.display = 'block';
    document.getElementById('loginFailedMessage').style.display = 'block';
    document.getElementById('loginFailedMessage').innerText = "Invalid email or password.";
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
