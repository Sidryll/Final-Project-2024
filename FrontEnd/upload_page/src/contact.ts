import axios from 'axios';

const FirstName = document.getElementById('FirstName') as HTMLInputElement;
const LastName = document.getElementById('LastName') as HTMLInputElement;
const email = document.getElementById('email') as HTMLInputElement;
const message = document.getElementById('message') as HTMLTextAreaElement;
const submitButton = document.getElementById('submit_button') as HTMLButtonElement;

submitButton.addEventListener('click', async (event) => {
  event.preventDefault();
  // implement submit functionality here:
  if (FirstName.value === '' || LastName.value === '' || email.value === '' || message.value === '') {
    alert('Some fields are blank!');
    return;
  }

  const emailpattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailpattern.test(email.value)) {
    alert('Please enter a valid Email');
    return;
  }

  console.log('First name: ', FirstName.value);
  console.log('Last name: ', LastName.value);
  console.log('email: ', email.value);
  console.log('field: ,', message.value);

  const response = await axios.post('http://localhost:3000/api/send-email', {
    FirstName: FirstName.value,
    LastName: LastName.value,
    email: email.value,
    message: message.value,
  });

  console.log(response.data);

  alert('form has been submitted!');
});
