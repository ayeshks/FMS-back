const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
// const serverless = require ('serverless-http')

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

const userRoutes = require('./routes/api/user');
const clubOwnerRoutes = require('./routes/api/clubowner');
const clubRoutes = require('./routes/api/club');
const clubdataRoutes = require('./routes/api/clubdata');
const coachesRoutes = require('./routes/api/coaches');
const playersRoutes = require('./routes/api/players');

// const currentModulePath = path.dirname(__filename);

// Serve static files from the "uploads" directory
// app.use('/uploads', express.static(path.join(currentModulePath, 'uploads')));
app.use('/uploads', express.static('uploads'));

app.use('/api/user', userRoutes);
app.use('/api/clubowner', clubOwnerRoutes);
app.use('/api/club', clubRoutes);
app.use('/api/clubdata', clubdataRoutes);
app.use('/api/coaches',coachesRoutes)
app.use('/api/players',playersRoutes)



const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
// module.exports.handler = serverless(app);



