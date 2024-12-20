import axios from 'axios';

const firstName = document.getElementById('first_name') as HTMLInputElement;
const lastName = document.getElementById('last_name') as HTMLInputElement;
const email = document.getElementById('email') as HTMLInputElement;
const message = document.getElementById('message') as HTMLInputElement;
const submitButton = document.getElementById('submit_button') as HTMLTextAreaElement;

submitButton.addEventListener('click', async (event) => {
  event.preventDefault();
  // implement submit functionality here:
  if (firstName.value === '' || lastName.value === '' || email.value === '' || message.value === '') {
    alert('Some fields are blank!');
    return;
  }

  const emailpattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailpattern.test(email.value)) {
    alert('Please enter a valid Email');
    return;
  }

  await axios.post('http://localhost:3000/api/send-email', {
    Firstname: firstName.value,
    lastName: lastName.value,
    email: email.value,
    message: message.value,
  });

  console.log('first name: ', firstName.value);
  console.log('last name: ', lastName.value);
  console.log('email: ', email.value);
  console.log('message: ', message.value);
  alert('form has been submitted!');
});
