/*const http = require('http');

const server = http.createServer((req, res) => {
//	  res.writeHead(200, { 'Content-Type': 'text/plain' });
//	  res.end('Hello, Node.js Web Server!');
	
});

const port = 3000;
server.listen(port, () => {
	  console.log(`Server running at http://localhost:${port}/`);
});*/

const express = require('express');
const app = express();

const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null,path.join(__dirname, 'uploads'));
	},
	filename: function (req, file, cb) {
		//const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 0E9)
		cb(null, file.originalname);
	}
})
const upload = multer({ storage });


app.get('/', (req, res) => {
	res.send("Hello World");
});

app.post('/api/upload', upload.single('file'),(req, res) => {
	res.send("uploaded successfully");
	console.log(res.file);
	//res.json(req.file);
});


const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log("listening on port" + port);
});
