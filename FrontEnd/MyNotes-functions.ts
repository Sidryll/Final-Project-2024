// //Get the notes in the database that have been added by the user. Uses userId as parameter.
// const fetchNotes = async (user_id: number) => {
//   try {
//     const response = await fetch(`http://localhost:3000/api/get-myNotes/${user_id}`);
//     const notes = response.json();
//     if (notes.length === 0) {
//       notesContainer.innerHTML = '<p>No notes found.</p>';
//       return;
//     }

//     notes.forEach((note: { note_id: number; topic: string; upload_date: string }) => {
//       const noteElement = document.createElement('div');
//       noteElement.className = 'note';
//       //Add Design of Notes here.
//       noteElement.innerHTML = `
//         <p><strong>Topic:</strong> ${note.topic}</p>
//         <p><strong>Uploaded on:</strong> ${note.upload_date}</p>
//         <button class="delete-button" data-id="${note.note_id}">Delete</button>
//       `;
//     });
//   } catch (error) {
//     console.error('Error fetching notes:', error);
//   }
// };

// //Function to delete the note from the my notes screen and from the database.
// const deleteNote = async (note_id: number) => {
//   if (!note_id) return;

//   try {
//     const response = await fetch(`http://localhost:3000/api/delete-notes/${note_id}`, {
//       method: 'DELETE',
//     });
//     if (response.ok) {
//       alert('Note deleted successfully!');
//     } else {
//       alert('Failed to delete note.');
//     }
//   } catch (error) {
//     console.error('Error deleting note:', error);
//     alert('An error occurred while deleting the note.');
//   }
// };

// //For displaying the notes in the my notes screen when navigating to it.
// document.addEventListener('DOMContentLoaded', () => {
//   const userId = 1; //placeholder, replace with the actual logged-in user ID
//   fetchNotes(userId);
// });
