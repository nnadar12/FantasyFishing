import express from 'express';
import path from 'path';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import the analysis function
import { getFish } from './analyzeFish.js';

// Because "type": "module" is in package.json, __dirname is not available. This is the workaround.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Endpoint for file uploads and analysis
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
        // Get the full path of the uploaded file
        const imagePath = req.file.path;
        
        // Call the AI function to get fish data
        const analysisResult = await getFish(imagePath);

        // Send back the file path and the analysis
        res.status(200).json({
            filePath: `/uploads/${req.file.filename}`,
            analysis: analysisResult
        });

    } catch (error) {
        console.error('Analysis failed:', error);
        res.status(500).json({ message: 'Failed to analyze the image.', error: error.message });
    }
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