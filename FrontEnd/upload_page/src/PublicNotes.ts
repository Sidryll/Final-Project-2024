document.addEventListener('DOMContentLoaded', () => {
  const currentPath: string = window.location.pathname;


  if (currentPath.includes('home_page.html')) {
    fetchPublicNotes();
  }

  // Set up event listeners for filtering options
  const yearSelect: HTMLSelectElement = document.getElementById('year') as HTMLSelectElement;
  const subjectInput: HTMLSelectElement = document.getElementById('subject_input') as HTMLSelectElement;
  const searchInput: HTMLInputElement = document.querySelector('.search_input') as HTMLInputElement;

  yearSelect.addEventListener('change', () => {
    updateSubjectsDropdown();
    filterNotes();
  });

  subjectInput.addEventListener('change', filterNotes);
  searchInput?.addEventListener('input', filterNotes);
});

// Define the shape of a note to help with TypeScript typing
interface Note {
  file_url: string;
  note_id: number;
  subject_name: string;
  topic: string;
  upload_date: string;
  username: string;
}

let notes: Note[] = []; // This will store the fetched notes

// Fetch the public notes from the API
const fetchPublicNotes = async (): Promise<void> => {
  try {
    const notesContainer: HTMLElement | null = document.getElementById('publicNotes');

    if (!notesContainer) {
      console.error('Notes container not found');
      return;
    }

    const response = await fetch('http://localhost:3000/api/display-notes');
    notes = await response.json(); // Store the fetched notes in the notes variable

    renderNotes(notes); // Render the fetched notes initially
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
};

// Render the notes on the page
const renderNotes = (notesToRender: Note[]): void => {
  const notesContainer: HTMLElement | null = document.getElementById('publicNotes');
  if (!notesContainer) return;

  notesContainer.innerHTML = notesToRender.length
    ? notesToRender
        .map(
          (note) => `
      <li class="note">
        <div class="notes_cont_box">
          <button class="save-button" data-id="${note.note_id}">Save</button>
          <a href="${note.file_url}" download title="Download" class = "download_a"><button class="download_button">Preview</button></a>
          <img src="src/pdf.svg" alt="file type" class="file_type_img">
          <p class="subject_cont"><strong>Subject:</strong> ${note.subject_name}</p>
          <p class="topic_cont"><strong>Topic:</strong> ${note.topic}</p>
          <p class="date_cont"><strong class="date_holder">Uploaded on:</strong> ${note.upload_date}</p>
          <img src="src/profile_notes.svg" alt="profile" class="profile">
          <p class="user_name_cont"><strong class="username">${note.username}</strong></p>
        </div>
      </li>
    `
        )
        .join('')
    : '<li>No notes found.</li>';

  // Add event listener for save buttons
  const saveButtons = document.querySelectorAll('.save-button');
  saveButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const noteId = (event.target as HTMLElement).getAttribute('data-id');
      const logged_account = localStorage.getItem('logged-email');
      const userId = logged_account ? localStorage.getItem(logged_account) : null;

      if (!userId) {
        console.error('No logged account found or invalid user ID');
        return;
      }
      if (noteId) {
        saveNote(Number(noteId), Number(userId));
      }
    });
  });
};

// Save the note function (assuming user_id is required for saving)
const saveNote = async (note_id: number, user_id: number) => {
  if (!note_id || !user_id) return;

  try {
    const response = await fetch('http://localhost:3000/api/save-note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ note_id, user_id }),
    });
    if (response.ok) {
      alert('Note saved successfully!');
    } else {
      alert('Failed to save note.');
    }
  } catch (error) {
    console.error('Error saving note:', error);
    alert('An error occurred while saving the note.');
  }
};

// Update the subjects dropdown based on the selected year
const updateSubjectsDropdown = (): void => {
  const yearSelect: HTMLSelectElement = document.getElementById('year') as HTMLSelectElement;
  const subjectInput: HTMLSelectElement = document.getElementById('subject_input') as HTMLSelectElement;

  const selectedYear = yearSelect.value;
  const subjects = updateSubjectsForYear(selectedYear);

  subjectInput.innerHTML = '<option value="">Select Subject</option>';
  if (subjects.length) {
    subjectInput.disabled = false;
    subjects.forEach((subject) => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      subjectInput.appendChild(option);
    });
  } else {
    subjectInput.disabled = true;
  }
};

// Filter notes based on year, subject, and search query
function filterNotes(): void {
  const yearSelect: HTMLSelectElement = document.getElementById('year') as HTMLSelectElement;
  const subjectInput: HTMLSelectElement = document.getElementById('subject_input') as HTMLSelectElement;
  const searchInput: HTMLInputElement = document.querySelector('.search_input') as HTMLInputElement;

  const selectedYear = yearSelect.value;
  const selectedSubject = subjectInput.value;
  const searchQuery = searchInput?.value.toLowerCase() || '';

  const filteredNotes = notes.filter((note) => {
    const validSubjects = updateSubjectsForYear(selectedYear);
    const isSubjectInYear = selectedYear ? validSubjects.includes(note.subject_name) : true;

    const matchesYear = selectedYear ? isSubjectInYear : true;
    const matchesSubject = selectedSubject ? note.subject_name === selectedSubject : true;
    const matchesSearch = searchQuery ? note.subject_name.toLowerCase().includes(searchQuery) || note.topic.toLowerCase().includes(searchQuery) : true;

    return matchesYear && matchesSubject && matchesSearch;
  });

  renderNotes(filteredNotes);
}

// Helper function to get subjects for a specific year
function updateSubjectsForYear(year: string): string[] {
  switch (year) {
    case 'first':
      return ['EMath 1101', 'RE 1', 'SE 1121', 'SEAL 1', 'PATHFIT1 M', 'PATHFIT1 W', 'NSTP1-CWTS', 'GEMath 1'];
    case 'second':
      return ['EE 2121', 'SE 2141', 'SE 2142', 'SE 2143', 'SE 2144', 'SE 2145'];
    case 'third':
      return ['SE 3141', 'SE 3142', 'SE 3143', 'SE 3144', 'CESocsci 3'];
    case 'fourth':
      return ['Engg 1030', 'Engg 1036', 'Engg 1037', 'SE 4141'];
    default:
      return [];
  }
}
