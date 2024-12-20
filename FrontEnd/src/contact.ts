const firstName = document.getElementById('first_name') as HTMLInputElement;
const lastName = document.getElementById('last_name') as HTMLInputElement;
const email = document.getElementById('email') as HTMLInputElement;
const phoneNumber = document.getElementById('phone_number') as HTMLInputElement;
const submitButton = document.getElementById('submit_button') as HTMLButtonElement;
const field = document.getElementById('field') as HTMLTextAreaElement;

submitButton.addEventListener('click', (event) => {
  event.preventDefault();
  // implement submit functionality here:
  if (firstName.value === '' || lastName.value === '' || email.value === '' || phoneNumber.value === '') {
    alert('Some fields are blank!');
    return;
  }

  console.log('first name: ', firstName.value);
  console.log('last name: ', lastName.value);
  console.log('email: ', email.value);
  console.log('phone number: ', phoneNumber.value);
  console.log('field: ,', field.value);
  alert('form has been submitted!');
});
