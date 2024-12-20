document.addEventListener('DOMContentLoaded', () => {
  const logged_account = localStorage.getItem('logged-email');
  const userId = logged_account ? localStorage.getItem(logged_account) : null;

  if (!userId) {
    console.error('No logged account found or invalid user ID');
    return;
  }

  const currentPath = window.location.pathname;

  // Check if we are on the "My Notes" page
  if (currentPath.includes('SavedNotes.html')) {
    fetchSavedNotes(Number(userId));
  }
});

const fetchSavedNotes = async (user_id: number) => {
  const notesContainer = document.getElementById('savedNotes') as HTMLUListElement;
  if (!notesContainer) return;

  notesContainer.innerHTML = ''; // Clear existing notes

  try {
    const response = await fetch(`http://localhost:3000/api/display-saved_notes?user_id=${user_id}`);
    const savedNotes = await response.json();
    console.log('Fetched saved notes:', savedNotes);

    savedNotes.forEach((savedNote: { saved_notes_id: number; topic: string; upload_date: string; subject_name: string; username: string }) => {
      const noteElement = document.createElement('div');
      noteElement.className = 'note';
      //Add Design of Notes here.
      noteElement.innerHTML = `

                <div class="notes_cont_box">
                  <button class="unsaved-button" data-id="${savedNote.saved_notes_id}">unSave</button>
                  <button class="download_button" title="Download">Download</button>
                  <img src="src/pdf.svg" alt="file type" class="file_type_img">
                  <p class="subject_cont"><strong>Subject:</strong>${savedNote.subject_name}</p>
                  <p class ="topic_cont"><strong>Topic:</strong> ${savedNote.topic}</p>
                  <p class = "date_cont"><strong class = "date_holder">Uploaded on:</strong> ${savedNote.upload_date}</p>
                  <img src="src/profile_notes.svg" alt="profile" class="profile">
                  <p class="user_name_cont"><strong class="username">${savedNote.username}</strong></p>
                </div>
            `;

      const unSaveButton = noteElement.querySelector('.unsave-button') as HTMLButtonElement;
      if (unSaveButton) {
        unSaveButton.addEventListener('click', () => {
          const saved_notes_id = parseInt(unSaveButton.getAttribute('data-id') || '', 10);
          if (saved_notes_id) {
            unSaveNote(saved_notes_id);
            noteElement.remove(); // Remove the note from the UI after deletion
          }
        });
      }
      notesContainer.appendChild(noteElement);
    });
  } catch (error) {
    console.error('Error fetching saved notes:', error);
    notesContainer.innerHTML = '<p>Error loading saved notes.</p>';
  }
};

const unSaveNote = async (saved_notes_id: number) => {
  if (!saved_notes_id) return;

  try {
    const response = await fetch(`http://localhost:3000/api/unsave-note?saved_notes_id=${saved_notes_id}`, {
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
