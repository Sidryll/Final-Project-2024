interface Note {
    id: number;
    title: string;
    content: string;
  }
  
  // Fetch notes from the API and render them in the container
  export async function fetchNotes(): Promise<void> {
    try {
      const response = await fetch('/api/getNotes.php');
      const notes: Note[] = await response.json();
  
      const notesContainer = document.getElementById('notes-container');
      if (notesContainer) {
        notesContainer.innerHTML = ''; // Clear existing notes
  
        notes.forEach((note) => {
          const noteElement = document.createElement('div');
          noteElement.classList.add('notes_cont_box');
          noteElement.innerHTML = `
            <button class="favorites" data-id="${note.id}">Save</button>
            <button class="download_button" title="Download" data-id="${note.id}">Download</button>
            <button class="delete_button" title="Delete" data-id="${note.id}">Delete</button>
            <img src="src/pdf.svg" alt="file type" class="file_type_img">
            <p class="subject_cont"><strong>Subject:</strong>${note.title}</p>
            <p class="topic_cont"><strong>Topic:</strong> ${note.content}</p>
            <p class="date_cont"><strong class="date_holder">Uploaded on:</strong> ${new Date().toLocaleDateString()}</p>
            <img src="src/profile_notes.svg" alt="profile" class="profile">
            <p class="user_name_cont"><strong class="username">User</strong></p>
          `;
          notesContainer.appendChild(noteElement);
        });
  
        // Add event listeners for download buttons
        const downloadButtons = document.querySelectorAll('.download_button');
        downloadButtons.forEach((button) =>
          button.addEventListener('click', (event) => {
            const noteId = (event.target as HTMLElement).getAttribute('data-id');
            if (noteId) {
              downloadNoteHandler(parseInt(noteId)); // Trigger download
            }
          })
        );
  
        // Add event listeners for delete buttons
        const deleteButtons = document.querySelectorAll('.delete_button');
        deleteButtons.forEach((button) =>
          button.addEventListener('click', (event) => {
            const noteId = (event.target as HTMLElement).getAttribute('data-id');
            if (noteId) {
              deleteNoteHandler(parseInt(noteId)); // Trigger delete
            }
          })
        );
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }
  
  // Function to handle note download as a .txt file
  export async function downloadNoteHandler(noteId: number): Promise<void> {
    try {
      const response = await fetch(`/api/downloadNote.php?id=${noteId}`);
      const result = await response.blob(); // Get the file as a Blob
      const url = window.URL.createObjectURL(result); // Create a URL for the Blob
      const link = document.createElement('a');
      link.href = url;
      link.download = `note_${noteId}.txt`; // Name the file with the note ID
      link.click(); // Trigger the download
      window.URL.revokeObjectURL(url); // Clean up the URL
    } catch (error) {
      console.error('Error downloading note:', error);
    }
  }
  
  // Function to handle note deletion by ID
  export async function deleteNoteHandler(noteId: number): Promise<void> {
    const confirmation = confirm("Are you sure you want to delete this note?");
    if (confirmation) {
      try {
        // Send the request to delete the note
        const response = await fetch('/api/deleteNote.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: noteId }),
        });
  
        const result = await response.json();
        if (result.success) {
          alert("Note deleted successfully!");
          fetchNotes(); // Reload the notes after deletion
        } else {
          alert("Failed to delete note.");
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  }
  