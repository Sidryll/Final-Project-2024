//Function for adding notes to the database
document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('upload_form') as HTMLFormElement;

  const yearSelect = document.getElementById('year') as HTMLSelectElement;
  const subjectInput = document.getElementById('subject_input') as HTMLSelectElement;
  // Function to update subjects based on the selected year
  function updateSubjects(): void {
    const year = yearSelect.value;
    let subjects: string[] = [];

    if (year === 'First-Year') {
      subjects = [
        'EMath 1101',
        'RE 1',
        'SE 1121',
        'SEAL 1',
        'PATHFIT1 M',
        'PATHFIT1 W',
        'NSTP1-CWTS',
        'GEMath 1',
        'EMath 1101',
        'EMath 1102',
        'Engg 1001',
        'GESocSci',
        'EMath 1202',
        'SEAL 2',
        'Engg 1006',
        'Engg 1009',
        'PATHFIT2 M',
        'PATHFIT2 W',
        'NSTP2-CWTS',
        'RE 2',
        'EMath 1201',
        'SE 1241',
        'SE 1242',
        'SE 1243',
      ];
    } else if (year === 'Second-Year') {
      subjects = [
        'EE 2121',
        'SE 2141',
        'SE 2142',
        'SE 2143',
        'SE 2144',
        'SE 2145',
        'EMath 2101',
        'PATHFIT3 M',
        'PATHFIT3 W',
        'Emath 2103',
        'SE 2236',
        'SE 2237',
        'SE 2238',
        'SE 2239',
        'SE 2240',
        'GEHum 1',
        'PATHFIT4 M',
        'PATHFIT4 W',
        'GEEng 1',
        'GESocsci 3',
      ];
    } else if (year === 'Third-Year') {
      subjects = [
        'SE 3141',
        'SE 3142',
        'SE 3143',
        'SE 3144',
        'CESocsci 3',
        'CETech1',
        'CELit1',
        'Engg 1025',
        'SE 3241',
        'SE 3242',
        'SE 3243',
        'SE 3244',
        'GESocSci 4',
        'GESocSci 5',
        'GESocSci 1',
        'Engg 1027',
        'GESocSci 2',
      ];
    } else if (year === 'Fourth-Year') {
      subjects = ['Engg 1030', 'Engg 1036', 'Engg 1037', 'SE 4141', 'SE 4142', 'SE TE 1', 'SE 4241', 'SE 4242', 'SE TE 2', 'SE TE 3', 'SE 4300'];
    }

    subjectInput.innerHTML = '<option value="">Select Subject</option>';
    subjects.forEach((subject) => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      subjectInput.appendChild(option);
    });

    subjectInput.disabled = false;
  }

  yearSelect.addEventListener('change', updateSubjects);

  uploadForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const year = yearSelect.value;
    const subject = subjectInput.value;
    // const year = (document.getElementById('year') as HTMLInputElement).value;
    // const subject = (document.getElementById('subject_input') as HTMLInputElement).value;
    const topicInput = document.getElementById('topic_input') as HTMLInputElement;
    const fileInput = document.getElementById('file_upload') as HTMLInputElement;

    if (!topicInput || !fileInput) {
      alert('Please complete all fields before submitting.');
      return;
    }

    const topic = topicInput.value;
    const file = fileInput.files ? fileInput.files[0] : null;

    if (!year || !subject || !topic || !file) {
      alert('Please complete all fields before submitting.');
      return;
    }

    const response = await fetch('http://localhost:3000/api/yearlevel_subject-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        yearLevelName: year,
        subjectName: subject,
      }),
    });

    if (response.ok) {
      const { yearLevelId, subjectId } = await response.json();

      const currentDate = new Date();

      // Format the date as YYYY-MM-DD
      const uploadDate = currentDate.toISOString().split('T')[0]; // Outputs: 'YYYY-MM-DD'
      const logged_account = localStorage.getItem('logged-email');
      const userId = logged_account ? localStorage.getItem(logged_account) : null;

      if (!userId) {
        console.error('User ID not found. Please log in.');
        return;
      }

      const formData = new FormData();
      formData.append('topic', topic);
      formData.append('filepath', file);
      formData.append('upload_date', uploadDate);
      formData.append('user_id', userId);
      formData.append('yearlevel_id', yearLevelId);
      formData.append('subject_id', subjectId);

      const uploadResponse = await fetch('http://localhost:3000/api/add-notes', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        alert('Note shared successfully!');
        uploadForm.reset();
      } else {
        alert('Error sharing note. Please try again.');
      }
    } else {
      alert('Failed to retrieve primary key. Please try again.');
    }
  });
});
