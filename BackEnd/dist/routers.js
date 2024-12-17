'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const bcrypt_1 = __importDefault(require('bcrypt'));
const supabase_js_1 = require('@supabase/supabase-js');
const fs_1 = __importDefault(require('fs'));
const express_1 = __importDefault(require('express'));
const db_1 = __importDefault(require('./db'));
const multer_1 = __importDefault(require('multer'));
const path_1 = __importDefault(require('path'));
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key in environment variables.');
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Set up Multer storage configuration
const storage = multer_1.default.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify folder to save uploaded files
  },
  filename: (req, file, cb) => {
    // Ensure the file name is unique by appending a timestamp
    cb(null, Date.now() + path_1.default.extname(file.originalname));
  },
});
// Initialize Multer with the storage configuration
const upload = (0, multer_1.default)({
  storage,
  fileFilter: (req, file, cb) => {
    // File type validation (only allow images)
    const filetypes = /jpeg|jpg|png|gif|pdf|/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});
//Direct file upload to remote storage
const handleFileUpload = (filePath, fileName) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      // Read file from the local disk
      const fileData = fs_1.default.readFileSync(filePath);
      // Upload file to Supabase storage
      const { data, error } = yield supabase.storage.from('uploads').upload(`uploads/${fileName}`, fileData, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) {
        console.error('Failed to upload file to Supabase:', error.message);
        return null;
      }
      console.log('File uploaded successfully:', data);
      return data;
    } catch (err) {
      console.error('Error handling file upload:', err.message);
      return null;
    } finally {
      // Clean up temporary file
      if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
      }
    }
  });
const router = express_1.default.Router();
// Router for adding a new account to the database
router.post('/add-account', upload.single('ProfilePicture'), (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { UserName, Email, Password } = req.body;
    const rawfile = req.file;
    const profilePicture = req.file ? req.file.path : null;
    try {
      // Hash the password
      const saltRounds = 10; // Number of salt rounds (adjust as needed)
      const hashedPassword = yield bcrypt_1.default.hash(Password, saltRounds);
      // Insert the hashed password into the database
      const result = yield db_1.default.query('INSERT INTO users (username, email, user_password, profile_picture) VALUES ($1, $2, $3, $4) RETURNING *', [
        UserName,
        Email,
        hashedPassword,
        profilePicture,
      ]);
      const userID = result.rows[0].user_id;
      const userName = result.rows[0].username;
      const email = result.rows[0].email;
      if (rawfile) {
        const ppfilepath = rawfile.path;
        const ppfilename = rawfile.filename;
        const uploadResult = yield handleFileUpload(ppfilepath, ppfilename);
        if (uploadResult) {
          res.status(200).json({ message: 'File uploaded successfully' });
        }
      }
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
  })
);
// Router to check if account already exists in the database
router.post('/validate-account', (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
      const result = yield db_1.default.query('SELECT user_password, user_id, username FROM users WHERE email = $1', [email]);
      if (result.rowCount === 0) {
        res.json({ exists: false, validPassword: false });
        return;
      }
      const userId = result.rows[0].user_id;
      const userName = result.rows[0].username;
      const stored_password = result.rows[0].user_password;
      const isPasswordCorrect = yield bcrypt_1.default.compare(password, stored_password);
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
  })
);
//Router for fetching data about the logged in user
router.get('/fetch-userData', (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.query;
    if (!userID) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }
    try {
      // Query user data from the database
      const result = yield db_1.default.query('SELECT * FROM users WHERE user_id = $1', [userID]);
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
  })
);
//Router for fetching notes added by the user
router.get('/fetch-userNotes', (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.query;
    if (!userID) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }
    try {
      // Query user data from the database
      const result = yield db_1.default.query('SELECT * FROM note WHERE user_id = $1', [userID]);
      if (result.rowCount === 0) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      // Send the user data as response
      const note = result.rows[0];
      res.json({
        userId: note.user_id,
        topic: note.topic,
        filepath: note.filepath,
        uploadDate: note.upload_date,
      });
      return;
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Database error' });
      return;
    }
  })
);
router.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
router.post('/add-notes', upload.single('filepath'), (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { topic, yearlevel_id, subject_id, upload_date } = req.body;
    const user_id = parseInt(req.body.user_id);
    // const yearlevel_id = parseInt(req.body.yearlevel_id);
    // const subject_id = parseInt(req.body.subject_id);
    const content = req.file ? path_1.default.normalize(req.file.path).replace(/\\/g, '/') : null; // Ensure that the file path is being received correctly
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
      const result = yield db_1.default.query('INSERT INTO note (topic, filepath, upload_date, user_id, yearlevel_id, subject_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING note_id', [
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
        const uploadResult = yield handleFileUpload(filepath, filename);
        if (uploadResult) {
          res.status(200).json({ message: 'File uploaded successfully' });
        }
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
  })
);
//Route to get the yearlevel and subject id
router.post('/yearlevel_subject-id', (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    console.log('Request body:', req.body);
    const { yearLevelName, subjectName } = req.body;
    if (!yearLevelName || !subjectName) {
      res.status(400).json({ message: 'Year level name and subject name are required' });
      return;
    }
    try {
      // Query for year level ID
      const yearLevelResult = yield db_1.default.query('SELECT yearLevel_id FROM yearlevel WHERE yearlevel_name = $1', [yearLevelName]);
      if (yearLevelResult.rowCount === 0) {
        res.status(404).json({ message: 'Year level not found' });
        return;
      }
      const yearLevelId = yearLevelResult.rows[0].yearlevel_id;
      console.log('Year level ID fetched:', yearLevelId);
      // Query for subject ID
      const subjectResult = yield db_1.default.query('SELECT subject_id FROM subject WHERE subject_name = $1', [subjectName]);
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
  })
);
//For Deleting Notes in the Database. Use the data-note-id attribute in html to use as parameter for deleting.
router.delete('/delete-notes', (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { note_id } = req.query;
    try {
      const result = yield db_1.default.query('DELETE FROM note WHERE note_id = $1 RETURNING *', [note_id]);
      if (result.rowCount === 0) {
        res.status(404).json({ message: 'Note not found' });
        return;
      }
      res.status(200).json({ message: `Note with ID ${note_id} deleted successfully.` });
    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({ message: 'Server error' });
    }
  })
);
//Router to display the added notes of the user in the My Notes screen
router.get('/get-myNotes', (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.query;
    try {
      // SQL query with JOINs to fetch notes along with username and subject name
      const result = yield db_1.default.query(
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
  })
);
//For Searching Notes
router.get('/search-notes', (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { note } = req.query;
    try {
      const results = yield db_1.default.query('SELECT * FROM note WHERE topic = $1', [note]);
      res.json(results.rows);
    } catch (error) {
      console.error('Error fetching subject:', error);
      res.status(500).json({ message: 'Server error' });
    }
  })
);
//For Displaying All Notes in the Database to the Homescreen
router.get('/display-notes', (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const results = yield db_1.default.query(
        'SELECT note.*, subject.subject_name, users.username FROM note INNER JOIN subject ON note.subject_id = subject.subject_id INNER JOIN users ON note.user_id = users.user_id;'
      );
      res.json(results.rows);
    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).send('Failed to fetch notes.');
    }
  })
);
//For Adding Notes to the SavedNotes
router.post('/save-note', (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { note_id, user_id } = req.body;
    if (!note_id || !user_id) {
      res.status(400).json({ message: 'note_id and user_id are required' });
      return;
    }
    try {
      const result = yield db_1.default.query('INSERT INTO saved_notes (note_id, user_id) VALUES ($1, $2) RETURNING *', [note_id, user_id]);
      res.status(201).json({
        message: 'Note saved successfully',
        savedNote: result.rows[0],
      });
    } catch (error) {
      console.error('Error saving note:', error);
      res.status(500).json({ message: 'Server error' });
    }
  })
);
//For Deleting Notes to the SvedNotes
router.delete('/unsave-note', (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { saved_notes_id } = req.query;
    try {
      const result = yield db_1.default.query('DELETE FROM saved_notes WHERE saved_notes_id = $1 RETURNING *', [saved_notes_id]);
      if (result.rowCount === 0) {
        res.status(404).json({ message: 'Saved Note not found' });
        return;
      }
      res.status(200).json({ message: `Saved Note with ID ${saved_notes_id} unsave successfully.` });
    } catch (error) {
      console.error('Error unsaving note:', error);
      res.status(500).json({ message: 'Server error' });
    }
  })
);
//For displaying savednotes by the user in the saved notes screen
router.get('/display-saved_notes', (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.query;
    if (!user_id) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }
    try {
      const results = yield db_1.default.query(
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
  })
);
exports.default = router;
