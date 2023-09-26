const express = require('express');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const upload = require('../../../middleware/upload'); // Import the upload middleware

const router = express.Router();

router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, 'uploads', filename)); // Adjust the path as needed
});

// Get Players
router.get('/', async (req, res) => {
    try {
      const playersCollection = await loadPlayersCollection();
      const playersData = await playersCollection.find({}).toArray();
  
      res.send(playersData);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

//Add Coach
let currentPlayerId = 10; // Initialize with the starting playerId value

router.post('/', upload.single('Pavatar'), async (req, res) => {
    try {
        const playersCollection = await loadPlayersCollection(); // Make sure this function is correctly implemented

        // Increment the playerId counter
        const playerCount = await playersCollection.countDocuments();

        // Increment the currentCoachId based on the count
        currentPlayerId = playerCount > 0 ? playerCount + 10 : 10;

        // Create the new player object
        const newPlayer = {
            playerId: currentPlayerId,
            PFname: req.body.PFname,
            PLname: req.body.PLname,
            PEmail: req.body.PEmail,
            PNumber: parseInt(req.body.PNumber), // Convert to number
            Pavatar: req.file ? req.file.filename : null, // Store the filename of the uploaded avatar
            PAge: req.body.PAge,
            PHeight: req.body.PHeight,
            PWeight: req.body.PWeight,  
            PField: req.body.PField,
            PJursey: req.body.PJursey,
            DeviceType: req.body.DeviceType,
            SerialNumber: req.body.SerialNumber,
            createdAt: new Date(),
            updatedAt: new Date(),
            
        };

        const result = await playersCollection.insertOne(newPlayer); // Use playersCollection instead of coachesCollection

        res.status(201).send({ message: 'Player added successfully', playerId: currentPlayerId });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

async function loadPlayersCollection() {
    const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster10.jhyuynm.mongodb.net/?retryWrites=true&w=majority', {
      useNewUrlParser: true,
    });
    return client.db('perfai-new').collection('Players');
  }
  
  module.exports = router;
