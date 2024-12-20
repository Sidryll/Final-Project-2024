document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('change-password-form') as HTMLFormElement;
  const responseMessageDiv = document.getElementById('response-message') as HTMLDivElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = (document.getElementById('email') as HTMLInputElement).value;
    const oldPassword = (document.getElementById('oldPassword') as HTMLInputElement).value;
    const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;

    const payload = { email, oldPassword, newPassword };

    // API to change password
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
        responseMessageDiv.innerHTML = `<p style="color: green;">${data.message}</p>`;
      } else {
        responseMessageDiv.innerHTML = `<p style="color: red;">${data.message}</p>`;
      }
    } catch {
      responseMessageDiv.innerHTML = `<p style="color: red;">An error occurred. Please try again later.</p>`;
    }
  });
});
