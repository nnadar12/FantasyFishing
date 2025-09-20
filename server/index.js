const express = require('express');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');

const app = express();

// --- Middleware ---
// Enable CORS for all routes
app.use(cors());

// Serve static files from the root directory (for index.html, script.js, etc.)
app.use(express.static(__dirname));

// Serve the 'uploads' folder as a static directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads');
        // Ensure the uploads directory exists
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Create a unique filename to prevent overwrites
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- Routes ---

// **THE FIX**: Add a root route to serve the login page by default.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});


// --- API Endpoints ---

// Endpoint for file uploads
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    // Send back the path to the file
    res.status(200).json({ filePath: `/uploads/${req.file.filename}` });
});

// Endpoint to get a list of all uploaded images
app.get('/api/images', (req, res) => {
    const uploadDirectory = path.join(__dirname, 'uploads/');
    
    fs.readdir(uploadDirectory, (err, files) => {
        if (err) {
            // If the directory doesn't exist, return an empty array
            if (err.code === 'ENOENT') {
                return res.status(200).json([]);
            }
            return res.status(500).json({ message: 'Unable to scan directory.' });
        }
        
        // Map files to their correct URL paths
        const imagePaths = files
            .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
            .map(file => `/uploads/${file}`);

        res.status(200).json(imagePaths);
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("listening on port " + port);
});