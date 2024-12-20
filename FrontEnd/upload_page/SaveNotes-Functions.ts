// const fetchSavedNotes = async (user_id: number) => {
//   const notesContainer = document.getElementById('notes_container');
//   if (!notesContainer) return;

//   notesContainer.innerHTML = ''; // Clear existing notes

//   try {
//     const response = await fetch(`http://localhost:3000/api/display-saved_notes/${user_id}`);
//     const savedNotes = response.json();

//     savedNotes.forEach((savedNote: { saved_notes_id: number; topic: string; upload_date: string }) => {
//       const noteElement = document.createElement('div');
//       noteElement.className = 'note';
//       //Add Design of Notes here.
//       noteElement.innerHTML = `
//               <p><strong>Topic:</strong> ${savedNote.topic}</p>
//               <p><strong>Uploaded on:</strong> ${savedNote.upload_date}</p>
//               <button class="unsave-button" data-id="${savedNote.saved_notes_id}">Save</button>
//             `;
//       notesContainer.appendChild(noteElement);
//     });
//   } catch (error) {
//     console.error('Error fetching saved notes:', error);
//     notesContainer.innerHTML = '<p>Error loading saved notes.</p>';
//   }

//   // button function to unsave the note
//   document.querySelectorAll('.unsave-button').forEach((button) => {
//     button.addEventListener('click', async (event) => {});
//   });
// };
