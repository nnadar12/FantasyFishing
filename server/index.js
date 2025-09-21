import express from 'express';
import path from 'path';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import the analysis functions
import { getFish } from './analyzeFish.js';
// THE CHANGE: Import the new regulations function
import { getRegulations } from './getRegulations.js';

// Because "type": "module" is in package.json, __dirname is not available. This is the workaround.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'uploads');
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- Routes ---
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
        const imagePath = req.file.path;
        const analysisResult = await getFish(imagePath);

        res.status(200).json({
            filePath: `/uploads/${req.file.filename}`,
            analysis: analysisResult
        });

    } catch (error) {
        console.error('Analysis failed:', error);
        res.status(500).json({ message: 'Failed to analyze the image.', error: error.message });
    }
});

// THE CHANGE: New API endpoint for fetching regulations
app.get('/api/regulations', async (req, res) => {
    const { species, state } = req.query; // Get species and state from query params

    if (!species || !state) {
        return res.status(400).json({ message: 'Species and state are required parameters.' });
    }

    try {
        // Call the imported function
        const regulationsText = await getRegulations(species, state);
        // Send the result back to the frontend
        res.status(200).json({ summary: regulationsText });
    } catch (error) {
        console.error('Failed to get regulations:', error);
        res.status(500).json({ message: 'Failed to retrieve regulations.', error: error.message });
    }
});


// Endpoint to get a list of all analyzed catches
app.get('/api/images', (req, res) => {
    const uploadDirectory = path.join(__dirname, 'uploads/');
    
    fs.readdir(uploadDirectory, (err, files) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(200).json([]);
            }
            return res.status(500).json({ message: 'Unable to scan directory.' });
        }
        
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        
        const catchPromises = imageFiles.map(imageFile => {
            return new Promise((resolve) => {
                const imageName = path.parse(imageFile).name;
                const jsonPath = path.join(uploadDirectory, `${imageName}.json`);

                fs.readFile(jsonPath, 'utf8', (err, data) => {
                    if (err) {
                        resolve(null);
                    } else {
                        try {
                            const analysis = JSON.parse(data);
                            resolve({
                                imageUrl: `/uploads/${imageFile}`,
                                analysis: analysis 
                            });
                        } catch (parseErr) {
                            resolve(null);
                        }
                    }
                });
            });
        });

        Promise.all(catchPromises).then(results => {
            const validCatches = results.filter(r => r !== null);
            res.status(200).json(validCatches);
        });
    });
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("listening on port " + port);
});