const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
// const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');

// Set up AWS S3 client

  

  

// const serverless = require ('serverless-http')
// const AWS = require("aws-sdk")
// const KEY_ID = "AKIAYBYPZNYKFUNXOON5"
// const SECRET_KEY = "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"


const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// const s3Client = new S3Client({
//     region: 'ap-south-1',
//     credentials: {
//       accessKeyId: 'AKIAYBYPZNYKJFFJJOV7',
//       secretAccessKey: '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',
//     },
//   });

  // Set up multer for file uploads
  const storage = multer.memoryStorage(); // Store files in memory to access buffer
  const upload = multer({ storage: storage });

// Importing routes
const userRoutes = require('./routes/api/user');
const clubOwnerRoutes = require('./routes/api/clubowner');
const clubRoutes = require('./routes/api/club');
const clubdataRoutes = require('./routes/api/clubdata');
const coachesRoutes = require('./routes/api/coaches');
const playersRoutes = require('./routes/api/players');
const teamsRoutes = require('./routes/api/teams');
const teamsdataRoutes = require('./routes/api/teamsdata');
const sessionRoutes = require('./routes/api/session');
const sessiondataRoutes = require('./routes/api/sessiondata');
const mapRoutes = require('./routes/api/map');
const iotRoutes = require('./routes/api/iot');
const performanceRoutes = require('./routes/api/performance');
const performancedataRoutes = require('./routes/api/performancedata');
// const currentModulePath = path.dirname(__filename);

// Serve static files from the "uploads" directory
// app.use('/uploads', express.static(path.join(currentModulePath, 'uploads')));
// Serve static files from the "uploads" directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/clubowner', clubOwnerRoutes);
app.use('/api/club', clubRoutes);
app.use('/api/clubdata', clubdataRoutes);
app.use('/api/coaches', coachesRoutes);
app.use('/api/players', playersRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/teamsdata', teamsdataRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/sessiondata', sessiondataRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/performancedata', performancedataRoutes);


const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));

// module.exports.handler = serverless(app);
