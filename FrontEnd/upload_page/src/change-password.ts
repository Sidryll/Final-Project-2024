document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('change-password-form') as HTMLFormElement;
  const responseMessageDiv = document.getElementById('response-message') as HTMLDivElement;

  // Add event listener to the form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const oldPassword = (document.getElementById('oldPassword') as HTMLInputElement).value;
    const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;

    // Create request payload
    const payload = { email, oldPassword, newPassword };

    // Make API request to change password
    try {
      const response = await fetch('http://localhost:3000/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        responseMessageDiv.innerHTML = `<p style="color: green;">${data.message}</p>`;
      } else {
        // Show error message
        responseMessageDiv.innerHTML = `<p style="color: red;">${data.message}</p>`;
      }
    } catch {
      responseMessageDiv.innerHTML = `<p style="color: red;">An error occurred. Please try again later.</p>`;
    }
  });
});
