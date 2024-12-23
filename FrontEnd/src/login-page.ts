//Login page

const emailInput = document.getElementById('email_input') as HTMLInputElement;
const passwordInput = document.getElementById('password_input') as HTMLInputElement;
const loginButton = document.getElementById('login_button') as HTMLButtonElement;
const togglePassword = document.getElementById('togglePassword') as HTMLButtonElement;
const toggleIcon = document.getElementById('toggleIcon') as HTMLImageElement;

const showIcon = 'src/images/show.png'; // Path to show icon
const hideIcon = 'src/images/hide.png'; // Path to hide icon

togglePassword.addEventListener('click', function () {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  toggleIcon.src = type === 'password' ? hideIcon : showIcon; // Switch icon based on visibility
});

loginButton.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    if (email === '' || password === '') {
      const fieldsMessage = document.getElementById('incomplete_fields_message')!;
      fieldsMessage.style.display = 'flex';

      const fillFieldsButton = fieldsMessage.querySelector<HTMLButtonElement>('#fill_fields_again');
      fillFieldsButton?.addEventListener('click', () => {
        fieldsMessage.style.display = 'none';
      });

      return; // Exit function early since fields are incomplete
    }

    const emailpattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailpattern.test(email)) {
      alert('Please enter a valid Email');
      return;
    }

    const response = await fetch('http://localhost:3000/api/validate-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const { exists, validPassword } = await response.json();

      if (!exists) {
        alert('Account does not exist.');
        return;
      }

      if (!validPassword) {
        const inco_pass_message = document.createElement('div');
        inco_pass_message.classList.add('incorrect_password');
        inco_pass_message.innerHTML = `
          <h3 class="inco_message">Incorrect Password!</h3>
          <button class="inco_button" id="try_again">Try Again</button>`;

        document.body.appendChild(inco_pass_message);

        passwordInput.value = '';
        const tryAgainButton = inco_pass_message.querySelector<HTMLButtonElement>('#try_again');

        if (tryAgainButton) {
          tryAgainButton.addEventListener('click', () => {
            inco_pass_message.remove();
          });
        }
        return;
      }
      localStorage.setItem('logged-email', `${email}`);
      alert('Login successful! Welcome back.');

      emailInput.value = '';
      passwordInput.value = '';
      window.location.href = 'upload_page/home_page.html';
    } else {
      throw new Error('Failed to validate account');
    }
  } catch (error) {
    console.error('Error:', error);
    return { exists: false, validPassword: false };
  }
});
