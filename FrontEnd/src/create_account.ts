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

  try {
    // Validation
    if (!username || !email || !password) {
      const incWarningMessage = document.getElementById('incomplete_fields_message');
      if (incWarningMessage) {
        incWarningMessage.style.display = 'block'; // Show the warning popup
        setTimeout(() => {
          incWarningMessage.style.display = 'none';
        }, 1200);
      }
      return;
    }

    const emailpattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailpattern.test(email)) {
      const invalidEmailMessage = document.getElementById('invalid_email_message')!;
      if (invalidEmailMessage) {
        invalidEmailMessage.style.display = 'block'; // Show the warning popup
        setTimeout(() => {
          invalidEmailMessage.style.display = 'none';
        }, 1200);
      }
      return; // Exit function early since email is invalid
    }

    const formData = new FormData();
    formData.append('UserName', username);
    formData.append('Email', email);
    formData.append('Password', password);

    // Send data to the server
    const response = await fetch('http://localhost:3000/api/add-account', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const newAccount = await response.json();
      console.log('Account added', newAccount);
      localStorage.setItem(`${newAccount.email}`, newAccount.userId);
      localStorage.setItem('logged-email', `${email}`);

      function showCustomAlert(userName: string): void {
        const signup_success = document.getElementById('signup_success') as HTMLDivElement;
        const userNamePlaceholder = document.getElementById('userName') as HTMLSpanElement;
        const signupMessage = document.getElementById('signupMessage') as HTMLParagraphElement;

        if (signupMessage && userNamePlaceholder) {
          userNamePlaceholder.textContent = userName;
          signupMessage.textContent = `Account created successfully! Welcome, ${userName}.`;

          signup_success.style.display = 'block';
          setTimeout(() => {
            signup_success.style.display = 'none';
          }, 2000);

          usernameInput.value = '';
          emailInput.value = '';
          passwordInput.value = '';

          setTimeout(() => {
            window.location.href = 'upload_page/home_page.html';
          }, 2000);
        } else {
          console.error('alertMessage or userNamePlaceholder not found');
        }
      }
      showCustomAlert(newAccount.userName);
    } else {
      console.error('Error adding account:', response.statusText);
      const inUsedWarningMessage = document.getElementById('email_in_use_message');
      if (inUsedWarningMessage) {
        inUsedWarningMessage.style.display = 'block';
        setTimeout(() => {
          inUsedWarningMessage.style.display = 'none';
        }, 1200);
      }
    }
  } catch (error) {
    console.log(process.env.DATABASE_URL);

    console.error('Error:', error);
    alert('An error occurred while creating the account. Please try again later.');
  }
});
