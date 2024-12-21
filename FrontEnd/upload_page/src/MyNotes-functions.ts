document.addEventListener('DOMContentLoaded', () => {
  const logged_account = localStorage.getItem('logged-email');
  const userId = logged_account ? localStorage.getItem(logged_account) : null;

  if (!userId) {
    console.error('No logged account found or invalid user ID');
    return;
  }

  const currentPath = window.location.pathname;

  // Check if we are on the "My Notes" page
  if (currentPath.includes('myNotes.html')) {
    fetchMyNotes(Number(userId));
  }

  // Set up event listeners for filtering options
  const searchInput: HTMLInputElement = document.querySelector('.search_input') as HTMLInputElement;

  searchInput?.addEventListener('input', (event) => {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    filterNotes(searchTerm);
  });
});

// Fetch Notes Function
const fetchMyNotes = async (user_id: number) => {
  try {
    const notesContainer = document.getElementById('myNotes') as HTMLUListElement;

    if (!notesContainer) {
      console.error('Notes container not found');
      return;
    }

    const response = await fetch(`http://localhost:3000/api/get-myNotes?user_id=${user_id}`);

    const notes = await response.json();

    // Store the fetched notes globally
    window.notes = notes;

    renderNotes(notes); // Render the fetched notes initially
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
};

// Render the notes on the page
const renderNotes = (notesToRender: any[]): void => {
  const notesContainer: HTMLElement | null = document.getElementById('myNotes');
  if (!notesContainer) return;

  notesContainer.innerHTML = notesToRender.length
    ? notesToRender
        .map(
          (note) => `
      <li class="note">
        <div class="notes_cont_box">
          <button class="delete-button" data-id="${note.note_id}">Delete</button>
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

  // Add event listener for delete buttons
  const deleteButtons = document.querySelectorAll('.delete-button');
  deleteButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      const noteId = (event.target as HTMLElement).getAttribute('data-id');
      if (noteId) {
        deleteNote(Number(noteId));
        // Remove the note from the UI after deletion
        const noteElement = (event.target as HTMLElement).closest('li');
        noteElement?.remove();
      }
    });
  });
};

// Function to filter notes based on search term
const filterNotes = (searchTerm: string): void => {
  const notes = window.notes || []; // Get the stored notes
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredNotes = notes.filter((note) => {
    const topic = note.topic.toLowerCase();
    const subject = note.subject_name.toLowerCase();
    const username = note.username.toLowerCase();

    return (
      topic.includes(normalizedSearchTerm) ||
      subject.includes(normalizedSearchTerm) ||
      username.includes(normalizedSearchTerm)
    );
  });

  renderNotes(filteredNotes);
};

// Function to delete the note from the database
const deleteNote = async (note_id: number) => {
  if (!note_id) return;

  try {
    const response = await fetch(`http://localhost:3000/api/delete-notes?note_id=${note_id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      alert('Note deleted successfully!');
    } else {
      alert('Failed to delete note.');
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    alert('An error occurred while deleting the note.');
  }
};
