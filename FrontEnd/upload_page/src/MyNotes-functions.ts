//Get the notes in the database that have been added by the user. Uses userId as parameter.
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

    // Clear existing notes
    notesContainer.innerHTML = '';

    if (notes.length === 0) {
      notesContainer.innerHTML = '<li>No notes found.</li>';
      return;
    }

    notes.forEach((note: { note_id: number; topic: string; upload_date: string; username: string; subject_name: string }) => {
      const noteElement = document.createElement('li');
      noteElement.className = 'note';
      noteElement.innerHTML = `
        
          <div class="notes_cont_box">
            <button class="save-button" data-id="${note.note_id}">Save</button>
            <button class="download_button" title="Download">Download</button>
            <img src="src/pdf.svg" alt="file type" class="file_type_img">
            <p class="subject_cont"><strong>Subject:</strong> ${note.subject_name}</p>
            <p class ="topic_cont"><strong>Topic:</strong> ${note.topic}</p>
            <p class = "date_cont"><strong class = "date_holder">Uploaded on:</strong> ${note.upload_date}</p>
            <img src="src/profile_notes.svg" alt="profile" class="profile">
            <p class="user_name_cont"><strong class="username">${note.username}</strong></p>
          </div>
      `;

      const deleteButton = noteElement.querySelector('.delete-button') as HTMLButtonElement;
      if (deleteButton) {
        deleteButton.addEventListener('click', () => {
          const noteId = parseInt(deleteButton.getAttribute('data-id') || '', 10);
          if (noteId) {
            deleteNote(noteId);
            noteElement.remove(); // Remove the note from the UI after deletion
          }
        });
      }
      notesContainer.appendChild(noteElement);
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
};

//Function to delete the note from the my notes screen and from the database.
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
