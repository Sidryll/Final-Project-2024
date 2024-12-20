// Create Account Page

const usernameInput = document.getElementById('username_input') as HTMLInputElement;
const emailInput = document.getElementById('email_input') as HTMLInputElement;
const passwordInput = document.getElementById('password_input') as HTMLInputElement;
const signupButton = document.getElementById('signup_button') as HTMLButtonElement;
const togglePassword = document.getElementById('togglePassword') as HTMLButtonElement;
const toggleIcon = document.getElementById('toggleIcon') as HTMLImageElement;
const profilePicture = document.getElementById('profile_picture') as HTMLInputElement;

const showIcon = 'src/images/show.png'; // Path to show icon
const hideIcon = 'src/images/hide.png'; // Path to hide icon

// Toggle password visibility
togglePassword.addEventListener('click', function () {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  toggleIcon.src = type === 'password' ? hideIcon : showIcon; // Switch icon based on visibility
});

// Handle sign-up
signupButton.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (username === '' || email === '' || password === '') {
    const fieldsMessage = document.getElementById('incomplete_fields_message')!;
    fieldsMessage.style.display = 'flex';

    const fillFieldsButton = fieldsMessage.querySelector<HTMLButtonElement>('#fill_fields_again');
    fillFieldsButton?.addEventListener('click', () => {
      fieldsMessage.style.display = 'none';
    });

    return; // Exit function early since fields are incomplete
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    const invalidEmailMessage = document.getElementById('invalid_email_message')!;
    invalidEmailMessage.style.display = 'flex';

    const tryEmailButton = invalidEmailMessage.querySelector<HTMLButtonElement>('#try_email_again');
    tryEmailButton?.addEventListener('click', () => {
      invalidEmailMessage.style.display = 'none';
    });

    return; // Exit function early since email is invalid
  }

  const formData = new FormData();
  formData.append('UserName', username);
  formData.append('Email', email);
  formData.append('Password', password);

  if (profilePicture.files && profilePicture.files[0]) {
    formData.append('ProfilePicture', profilePicture.files[0]);
  }

  // Send data to the server
  try {
    const response = await fetch('http://localhost:3000/api/add-account', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const newAccount = await response.json();
      console.log('Account added', newAccount);
      localStorage.setItem(`${newAccount.email}`, newAccount.userId);
      alert(`Account created successfully! Welcome, ${newAccount.userName}.`);
      // Clear input fields
      usernameInput.value = '';
      emailInput.value = '';
      passwordInput.value = '';
      profilePicture.value = '';
      // Redirect to another page if necessary
      window.location.href = 'upload_page/home_page.html';
    } else {
      console.error('Error adding account:', response.statusText);
      alert('Failed to add account. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while creating the account. Please try again later.');
  }
});
