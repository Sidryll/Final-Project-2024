// Define the interface for a note
interface Note {
  year: string;
  subject: string;
  topic: string;
  fileName: string;
  fileData: string | ArrayBuffer | null;
  dateAdded: Date;
  username: string;
}

document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('upload_form') as HTMLFormElement;
  const yearSelect = document.getElementById('year') as HTMLSelectElement;
  const subjectInput = document.getElementById('subject_input') as HTMLSelectElement;
  // const notesContainer = document.querySelector('.notes_container') as HTMLDivElement;

  // Function to update subjects based on the selected year
  function updateSubjects(): void {
    const year = yearSelect.value;
    let subjects: string[] = [];

    if (year === 'first') {
      subjects = ['Calculus 1', 'Chemistry', 'Software Development 1', 'Physics', 'General Math'];
    } else if (year === 'second') {
      subjects = ['Algorithms', 'Data Structures', 'Linear Algebra', 'Operating Systems'];
    } else if (year === 'third') {
      subjects = ['Machine Learning', 'Computer Networks', 'Software Engineering'];
    } else if (year === 'fourth') {
      subjects = ['Capstone Project', 'Advanced Programming', 'Distributed Systems'];
    }

    subjectInput.innerHTML = '<option value="">Select Subject</option>';
    subjects.forEach((subject) => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      subjectInput.appendChild(option);
    });

    subjectInput.disabled = false;
  }

  yearSelect.addEventListener('change', updateSubjects);

  //Function to display notes
  // function displayNotes(): void {
  //   const notes: Note[] = JSON.parse(localStorage.getItem('notes') || '[]');
  //   notesContainer.innerHTML = '';

  //   if (notes.length === 0) {
  //     notesContainer.innerHTML = '<p>No notes uploaded yet.</p>';
  //     return;
  //   }

  //   notes.forEach((note) => {
  //     const noteBox = document.createElement('div');
  //     noteBox.classList.add('notes_cont_box');

  //     noteBox.innerHTML = `
  //       <button class="favorites">
  //           <!-- SVG Icon -->
  //       </button>
  //       <button class="download_button">
  //           <!-- SVG Icon -->
  //       </button>
  //       <img src="src/pdf.svg" alt="file type" class="file_type_img">
  //       <p class="subject_cont"><strong>Subject:</strong> ${note.subject}</p>
  //       <p class="topic_cont"><strong>Topic:</strong> ${note.topic}</p>
  //       <img src="src/profile_notes.svg" alt="profile" class="profile">
  //       <p class="user_name_cont">
  //           <strong class="username">${note.username || 'Anonymous'}</strong>
  //       </p>
  //     `;

  //     notesContainer.appendChild(noteBox);
  //   });
  // }

  // Handle form submission
  uploadForm.addEventListener('submit', function (event: Event) {
    event.preventDefault();

    const year = yearSelect.value;
    const subject = subjectInput.value;
    const topic = (document.getElementById('topic_input') as HTMLInputElement).value;
    const fileUpload = (document.getElementById('file_upload') as HTMLInputElement).files?.[0];

    if (!year || !subject || !topic || !fileUpload) {
      alert('Please fill all fields and select a file.');
      return;
    }

    // Example username (replace with dynamic data if available)
    const username = 'Leander Galido';

    // Convert the file to Base64
    const reader = new FileReader();
    reader.onload = function (e) {
      const fileData = e.target?.result; // Base64 string

      const note: Note = {
        year: year,
        subject: subject,
        topic: topic,
        fileName: fileUpload.name,
        fileData: fileData,
        dateAdded: new Date(),
        username: username,
      };

      const notes: Note[] = JSON.parse(localStorage.getItem('notes') || '[]');
      notes.push(note);
      localStorage.setItem('notes', JSON.stringify(notes));

      uploadForm.reset();
      subjectInput.disabled = true;

      // Optionally, redirect to Index Page
      window.location.href = 'home_page.html';
    };

    reader.readAsDataURL(fileUpload);
  });

  // Optionally, display notes on the upload page
  // displayNotes();
});
