export const downloadNoteHandler = async (savedNotesId: number): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:3000/api/download-note?saved_notes_id=${savedNotesId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch note for download');
      }
  
      const blob = await response.blob();  // Moni ang gakwa sang file as a Blob
      const url = window.URL.createObjectURL(blob);  // Moni ga create sang URL para sa Blob
  
      // Amo ni ang acnhor nga element para ma trigger ang download button
      const link = document.createElement('a');
      link.href = url;
      link.download = `saved_note_${savedNotesId}.txt`;  // Moni ang ma set sang filename sang gin dl.
      link.click();  // Specifically, moni ga trigger onclick or when clicked
  

      // Amo ni ma catch after trying ang fucntion abovve.
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading note:', error);
    }
  };
  