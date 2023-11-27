const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

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

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
