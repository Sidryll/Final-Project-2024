export const downloadNoteHandler = async (noteId: number, isSavedNote: boolean): Promise<void> => {
    try {
      // Determine the correct API URL based on whether it's a saved note or public note
      const apiUrl = isSavedNote
        ? `http://localhost:3000/api/download-note?saved_notes_id=${noteId}`
        : `http://localhost:3000/api/download-public-note?note_id=${noteId}`; // New endpoint for public notes
  
      const response = await fetch(apiUrl);
  
      if (!response.ok) {
        throw new Error('Failed to fetch note for download');
      }
  
      const blob = await response.blob();  // Convert the response to a Blob
      const url = window.URL.createObjectURL(blob);  // Create a temporary URL for the Blob
  
      // Create an anchor element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `note_${noteId}.txt`;  // Name the file based on the note ID
      link.click();  // Trigger the download
  
      // Release the Blob URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading note:', error);
    }
  };
  