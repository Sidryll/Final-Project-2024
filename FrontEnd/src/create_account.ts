// Create Account Page

const usernameInput = document.getElementById('username_input') as HTMLInputElement;
const emailInput = document.getElementById('email_input') as HTMLInputElement;
const passwordInput = document.getElementById('password_input') as HTMLInputElement;
const signupButton = document.getElementById('signup_button') as HTMLButtonElement;
const togglePassword = document.getElementById('togglePassword') as HTMLButtonElement;
const toggleIcon = document.getElementById('toggleIcon') as HTMLImageElement;
// const profilePicture = document.getElementById('profile_picture') as HTMLInputElement;

const showIcon = 'src/images/show.png'; // Path to show icon
const hideIcon = 'src/images/hide.png'; // Path to hide sicon

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

  if (!username || !email || !password) {
    const incWarningMessage = document.getElementById('incomplete_fields_message');
    if (incWarningMessage) {
      incWarningMessage.style.display = 'block';
      setTimeout(() => {
        incWarningMessage.style.display = 'none';
      }, 1200);
    }
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const invalidEmailMessage = document.getElementById('invalid_email_message');
    if (invalidEmailMessage) {
      invalidEmailMessage.style.display = 'block';
      setTimeout(() => {
        invalidEmailMessage.style.display = 'none';
      }, 1200);
    }
    return;
  }

  if (password.length < 8) {
    alert('Password must be at least 8 characters long');
    return;
  }

  try {
    const payload = { UserName: username, Email: email, Password: password };

    const response = await fetch('http://localhost:3000/api/add-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const newAccount = await response.json();
      localStorage.setItem(`${newAccount.email}`, newAccount.userId);
      localStorage.setItem('logged-email', `${email}`);

      const signup_success = document.getElementById('signup_success') as HTMLDivElement;
      const userNamePlaceholder = document.getElementById('userName') as HTMLSpanElement;

      userNamePlaceholder.textContent = newAccount.userName;
      signup_success.style.display = 'block';

      usernameInput.value = '';
      emailInput.value = '';
      passwordInput.value = '';

      setTimeout(() => {
        window.location.href = 'upload_page/home_page.html';
      }, 2000);
    } else {
      const errorData = await response.json();
      console.error('Error adding account:', errorData.message || response.statusText);

      if (response.status === 409) {
        const inUsedWarningMessage = document.getElementById('email_in_use_message');
        if (inUsedWarningMessage) {
          inUsedWarningMessage.style.display = 'block';
          setTimeout(() => {
            inUsedWarningMessage.style.display = 'none';
          }, 1200);
        }
      } else {
        alert(`Unexpected error: ${errorData.message || 'Unknown error'}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while creating the account. Please try again later.');
  }
});
