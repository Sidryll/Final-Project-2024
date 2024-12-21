import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import express, { Request, Response } from 'express';
import pool from './db';
import multer from 'multer';
import path from 'path';
import sendEmail from './send-email';
import mime from 'mime-types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key in environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify folder to save uploaded files
  },
  filename: (req, file, cb) => {
    // Ensure the file name is unique by appending a timestamp
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Initialize Multer with the storage configuration
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log('File MIME Type:', file.mimetype);
    console.log('File Extension:', path.extname(file.originalname).toLowerCase());

    const filetypes = /\.(jpeg|jpg|png|gif|pdf|pptx|docx)$/i; // Match extensions
    const mimetypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]; // Match MIME types

    const extname = filetypes.test(file.originalname.toLowerCase());
    const mimetype = mimetypes.includes(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

//Direct file upload to remote storage
const handleFileUpload = async (filePath: string, fileName: string): Promise<void | null> => {
  try {
    const contentType = mime.lookup(fileName) || 'application/octet-stream';
    // Read file from the local disk
    const fileData = fs.readFileSync(filePath);

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage.from('uploads').upload(`uploads/${fileName}`, fileData, {
      cacheControl: '3600',
      upsert: false,
      contentType,
    });

    if (error) {
      console.error('Failed to upload file to Supabase:', error.message);
      return null;
    }

    console.log('File uploaded successfully:', data);
  } catch (err) {
    console.error('Error handling file upload:', (err as Error).message);
    return null;
  } finally {
    // Clean up temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

const router = express.Router();

// Router for adding a new account to the database
router.post('/add-account', async (req: Request, res: Response) => {
  const { UserName, Email, Password } = req.body;

  try {
    // Hash the password
    const saltRounds = 10; // Number of salt rounds (adjust as needed)
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    // Insert the hashed password into the database
    const result = await pool.query('INSERT INTO users (username, email, user_password) VALUES ($1, $2, $3) RETURNING *', [UserName, Email, hashedPassword]);

    const userID = result.rows[0].user_id;
    const userName = result.rows[0].username;
    const email = result.rows[0].email;

    res.status(201).json({
      message: 'Account created successfully',
      userId: userID, // Send back the userId to the frontend
      userName: userName,
      email: email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Router to check if account already exists in the database
router.post('/validate-account', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT user_password, user_id, username FROM users WHERE email = $1', [email]);

    if (result.rowCount === 0) {
      res.json({ exists: false, validPassword: false });
      return;
    }

    const userId = result.rows[0].user_id;
    const userName = result.rows[0].username;
    const stored_password = result.rows[0].user_password;

    const isPasswordCorrect = await bcrypt.compare(password, stored_password);

    if (!isPasswordCorrect) {
      res.json({
        exists: true,
        validPassword: false,
      });
      return;
    }

    res.json({
      exists: true,
      validPassword: true,
      userId,
      userName,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error' });
    return;
  }
});

//Router for fetching data about the logged in user
router.post('/fetch-using-email', async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    res.status(201).json(result.rows[0]);
  } catch {
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

//Router for fetching data about the logged in user

router.get('/fetch-userData', async (req: Request, res: Response): Promise<void> => {
  const { userID } = req.query;

  if (!userID) {
    res.status(400).json({ message: 'User ID is required' });
    return;
  }

  try {
    // Query user data from the database
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userID]);

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Send the user data as response
    const user = result.rows[0];
    res.json({
      userId: user.user_id,
      userName: user.username,
      email: user.mail,
      profilePicture: user.profile_picture,
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Database error' });
    return;
  }
});

//For uploading notes
router.post('/add-notes', upload.single('filepath'), async (req: Request, res: Response): Promise<void> => {
  const { topic, yearlevel_id, subject_id, upload_date } = req.body;
  const user_id = parseInt(req.body.user_id);
  const content = req.file ? path.normalize(req.file.path).replace(/\\/g, '/') : null; // Ensure that the file path is being received correctly
  console.log('Year Level ID:', yearlevel_id);
  console.log('Subject ID:', subject_id);

  console.log(req.body);
  console.log(req.file);
  if (!content) {
    res.status(400).json({ message: 'File upload failed or file missing' });
    return;
  }

  try {
    const contentfile = req.file;
    const result = await pool.query('INSERT INTO note (topic, filepath, upload_date, user_id, yearlevel_id, subject_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING note_id', [
      topic,
      content,
      upload_date,
      user_id,
      yearlevel_id,
      subject_id,
    ]);

    if (contentfile) {
      const filepath = contentfile.path;
      const filename = contentfile.filename;
      await handleFileUpload(filepath, filename);
    }

    const noteID = result.rows[0].note_id;
    const r = result.rows[0];
    console.log(noteID);
    console.log(r);
    res.status(201).json({ message: 'Note added successfully', noteID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

//Router to display the added notes of the user in the My Notes screen
router.get('/get-myNotes', async (req: Request, res: Response) => {
  const { user_id } = req.query;

  try {
    // SQL query with JOINs to fetch notes along with username and subject name
    const result = await pool.query(
      `SELECT note.*, subject.subject_name, users.username
       FROM note
       INNER JOIN subject ON note.subject_id = subject.subject_id
       INNER JOIN users ON note.user_id = users.user_id
       WHERE note.user_id = $1`,
      [user_id]
    );

    // Respond with the notes, including subject_name and username
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

//For Deleting Notes in the Database. Use the data-note-id attribute in html to use as parameter for deleting.
router.delete('/delete-notes', async (req: Request, res: Response): Promise<void> => {
  const { note_id } = req.query;
  try {
    const result = await pool.query('DELETE FROM note WHERE note_id = $1 RETURNING *', [note_id]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }
    res.status(200).json({ message: `Note with ID ${note_id} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//For Displaying All Notes in the Database to the Homescreen
router.get('/display-notes', async (req: Request, res: Response) => {
  try {
    const results = await pool.query(
      `SELECT 
         note.*, 
         subject.subject_name, 
         users.username 
       FROM note 
       INNER JOIN subject ON note.subject_id = subject.subject_id 
       INNER JOIN users ON note.user_id = users.user_id;`
    );

    // Construct the full URL for each note
    const baseUrl = 'https://pvgddxeevqhhdwcihwqp.supabase.co/storage/v1/object/public/uploads/';
    const notesWithUrls = results.rows.map((note) => ({
      ...note,
      file_url: note.filepath ? `${baseUrl}${note.filepath}` : null,
    }));

    res.json(notesWithUrls);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).send('Failed to fetch notes.');
  }
});

//For displaying savednotes by the user in the saved notes screen

router.get('/display-saved_notes', async (req: Request, res: Response): Promise<void> => {
  const { user_id } = req.query;

  if (!user_id) {
    res.status(400).json({ message: 'User ID is required' });
    return;
  }

  try {
    const results = await pool.query(
      `SELECT 
        note.*, 
        saved_notes.saved_notes_id,
        users.username, 
        subject.subject_name
      FROM note
      INNER JOIN saved_notes ON note.note_id = saved_notes.note_id
      INNER JOIN users ON note.user_id = users.user_id
      INNER JOIN subject ON note.subject_id = subject.subject_id
      WHERE saved_notes.user_id = $1`,
      [user_id]
    );

    if (results.rowCount === 0) {
      res.status(404).json({ message: 'Notes not found' });
      return;
    }

    res.json(results.rows);
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//For Adding Notes to the SavedNotes
router.post('/save-note', async (req: Request, res: Response): Promise<void> => {
  const { note_id, user_id } = req.body;

  if (!note_id || !user_id) {
    res.status(400).json({ message: 'note_id and user_id are required' });
    return;
  }

  try {
    const result = await pool.query('INSERT INTO saved_notes (note_id, user_id) VALUES ($1, $2) RETURNING *', [note_id, user_id]);
    res.status(201).json({
      message: 'Note saved successfully',
      savedNote: result.rows[0],
    });
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//For Deleting Notes to the SvedNotes

router.delete('/unsave-note', async (req: Request, res: Response): Promise<void> => {
  const { saved_notes_id } = req.query;

  try {
    const result = await pool.query('DELETE FROM saved_notes WHERE saved_notes_id = $1 RETURNING *', [saved_notes_id]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Saved Note not found' });
      return;
    }
    res.status(200).json({ message: `Saved Note with ID ${saved_notes_id} unsave successfully.` });
  } catch (error) {
    console.error('Error unsaving note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//For displaying savednotes by the user in the saved notes screen

router.get('/display-saved_notes', async (req: Request, res: Response): Promise<void> => {
  const { user_id } = req.query;

  if (!user_id) {
    res.status(400).json({ message: 'User ID is required' });
    return;
  }

  try {
    const results = await pool.query(
      `SELECT 
        note.*, 
        saved_notes.saved_notes_id,
        users.username, 
        subject.subject_name
      FROM note
      INNER JOIN saved_notes ON note.note_id = saved_notes.note_id
      INNER JOIN users ON note.user_id = users.user_id
      INNER JOIN subject ON note.subject_id = subject.subject_id
      WHERE saved_notes.user_id = $1`,
      [user_id]
    );

    if (results.rowCount === 0) {
      res.status(404).json({ message: 'Notes not found' });
      return;
    }

    res.json(results.rows);
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//Route to get the yearlevel and subject id
router.post('/yearlevel_subject-id', async (req: Request, res: Response): Promise<void> => {
  console.log('Request body:', req.body);
  const { yearLevelName, subjectName } = req.body;

  if (!yearLevelName || !subjectName) {
    res.status(400).json({ message: 'Year level name and subject name are required' });
    return;
  }

  try {
    // Query for year level ID
    const yearLevelResult = await pool.query('SELECT yearLevel_id FROM yearlevel WHERE yearlevel_name = $1', [yearLevelName]);

    if (yearLevelResult.rowCount === 0) {
      res.status(404).json({ message: 'Year level not found' });
      return;
    }

    const yearLevelId = yearLevelResult.rows[0].yearlevel_id;
    console.log('Year level ID fetched:', yearLevelId);
    // Query for subject ID
    const subjectResult = await pool.query('SELECT subject_id FROM subject WHERE subject_name = $1', [subjectName]);

    if (subjectResult.rowCount === 0) {
      res.status(404).json({ message: 'Subject not found' });
      return;
    }

    const subjectId = subjectResult.rows[0].subject_id;

    console.log('Subject ID fetched:', subjectId);

    // Return both IDs in a single response
    res.status(200).json({ yearLevelId, subjectId });
  } catch (error) {
    console.error('Error fetching IDs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//For Deleting Notes in the Database. Use the data-note-id attribute in html to use as parameter for deleting.
router.delete('/delete-notes', async (req: Request, res: Response): Promise<void> => {
  const { note_id } = req.query;
  try {
    const result = await pool.query('DELETE FROM note WHERE note_id = $1 RETURNING *', [note_id]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }
    res.status(200).json({ message: `Note with ID ${note_id} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//Router to display the added notes of the user in the My Notes screen
router.get('/get-myNotes', async (req: Request, res: Response) => {
  const { user_id } = req.query;

  try {
    // SQL query with JOINs to fetch notes along with username and subject name
    const result = await pool.query(
      `SELECT note.*, subject.subject_name, users.username
       FROM note
       INNER JOIN subject ON note.subject_id = subject.subject_id
       INNER JOIN users ON note.user_id = users.user_id
       WHERE note.user_id = $1`,
      [user_id]
    );

    // Respond with the notes, including subject_name and username
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

//For Searching Notes
router.get('/search-notes', async (req: Request, res: Response) => {
  const { note } = req.query;

  try {
    const results = await pool.query('SELECT * FROM note WHERE topic = $1', [note]);
    res.json(results.rows);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//For Displaying All Notes in the Database to the Homescreen
router.get('/display-notes', async (req: Request, res: Response) => {
  try {
    const results = await pool.query(
      'SELECT note.*, subject.subject_name, users.username FROM note INNER JOIN subject ON note.subject_id = subject.subject_id INNER JOIN users ON note.user_id = users.user_id;'
    );
    res.json(results.rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).send('Failed to fetch notes.');
  }
});

//For Adding Notes to the SavedNotes
router.post('/save-note', async (req: Request, res: Response): Promise<void> => {
  const { note_id, user_id } = req.body;

  if (!note_id || !user_id) {
    res.status(400).json({ message: 'note_id and user_id are required' });
    return;
  }

  try {
    const result = await pool.query('INSERT INTO saved_notes (note_id, user_id) VALUES ($1, $2) RETURNING *', [note_id, user_id]);
    res.status(201).json({
      message: 'Note saved successfully',
      savedNote: result.rows[0],
    });
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//For Deleting Notes to the SvedNotes

router.delete('/unsave-note', async (req: Request, res: Response): Promise<void> => {
  const { saved_notes_id } = req.query;

  try {
    const result = await pool.query('DELETE FROM saved_notes WHERE saved_notes_id = $1 RETURNING *', [saved_notes_id]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Saved Note not found' });
      return;
    }
    res.status(200).json({ message: `Saved Note with ID ${saved_notes_id} unsave successfully.` });
  } catch (error) {
    console.error('Error unsaving note:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//For displaying savednotes by the user in the saved notes screen

router.get('/display-saved_notes', async (req: Request, res: Response): Promise<void> => {
  const { user_id } = req.query;

  if (!user_id) {
    res.status(400).json({ message: 'User ID is required' });
    return;
  }

  try {
    const results = await pool.query(
      `SELECT 
        note.*, 
        saved_notes.saved_notes_id,
        users.username, 
        subject.subject_name
      FROM note
      INNER JOIN saved_notes ON note.note_id = saved_notes.note_id
      INNER JOIN users ON note.user_id = users.user_id
      INNER JOIN subject ON note.subject_id = subject.subject_id
      WHERE saved_notes.user_id = $1`,
      [user_id]
    );

    if (results.rowCount === 0) {
      res.status(404).json({ message: 'Notes not found' });
      return;
    }

    res.json(results.rows);
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/change-password', async (req: Request, res: Response): Promise<void> => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    // Validate input
    if (!email || !oldPassword || !newPassword) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }

    // Check if the user exists in the database
    const userQuery = 'SELECT user_id, user_password FROM users WHERE email = $1'; 
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const user = userResult.rows[0];

    // Verify the old password
    const isMatch = await bcrypt.compare(oldPassword, user.user_password); 
    if (!isMatch) {
      res.status(401).json({ message: 'Current password is incorrect.' });
      return;
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the password in the database
    const updateQuery = 'UPDATE users SET user_password = $1 WHERE user_id = $2'; 
    await pool.query(updateQuery, [hashedPassword, user.user_id]); 

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.put('/change-username', async (req: Request, res: Response) => {
  const { username, email } = req.body;
  try {
    const query = 'UPDATE users SET username = $1 WHERE email = $2';
    const values = [username, email];
    await pool.query(query, values);
    res.status(200).json({ message: 'username updated!' });
  } catch {
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

router.post('/send-email', async (req: Request, res: Response) => {
  try {
    const { FirstName, LastName, email, message } = req.body;
    await sendEmail(FirstName, LastName, email, message);
    res.status(200).send('message sent!');
  } catch (error) {
    console.log(error);
    res.status(500).send('something went wrong');
  }
});

export default router;
