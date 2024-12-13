//Get the notes in the database that have been added by the user. Uses userId as parameter.
document.addEventListener('DOMContentLoaded', () => {
  //   const userId = localStorage.getItem('userID');
  const currentPath = window.location.pathname;

  // Check if we are on the "My Notes" page
  if (currentPath.includes('home_page.html')) {
    fetchPublicNotes();
  }
});

// Fetch Notes Function
const fetchPublicNotes = async () => {
  try {
    const notesContainer = document.getElementById('publicNotes') as HTMLUListElement;

    if (!notesContainer) {
      console.error('Notes container not found');
      return;
    }

    const response = await fetch(`http://localhost:3000/api/display-notes`);

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
      const saveButton = noteElement.querySelector('.save-button') as HTMLButtonElement;
      if (saveButton) {
        saveButton.addEventListener('click', () => {
          const noteId = parseInt(saveButton.getAttribute('data-id') || '', 10);
          const logged_account = localStorage.getItem('logged-email');
          const userId = logged_account ? localStorage.getItem(logged_account) : null;

          if (!userId) {
            console.error('No logged account found or invalid user ID');
            return;
          }
          if (noteId) {
            saveNote(noteId, Number(userId));
          }
        });
      }
      notesContainer.appendChild(noteElement);
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
  }
};

//Function to save a note to the savednotes screen

const saveNote = async (note_id: number, user_id: number) => {
  if (!note_id || !user_id) return;

  try {
    const response = await fetch(`http://localhost:3000/api/save-note`, {
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
