const express = require('express');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const upload = require('../../../middleware/upload'); // Import the upload middleware
// const fs = require('fs');

const router = express.Router();

router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, 'uploads', filename)); // Adjust the path as needed
});

// Get coache
router.get('/', async (req, res) => {
    try {
      const coachesCollection = await loadCoachesCollection();
      const coachesData = await coachesCollection.find({}).toArray();
  
      res.send(coachesData);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

//Add Coach
let currentCoachId = 10;

router.post('/', upload.single('avatar'), async (req, res) => {
    try {
        const coachesCollection = await loadCoachesCollection();

        // Fetch the current count of coaches from the database
        const coachCount = await coachesCollection.countDocuments();

        // Increment the currentCoachId based on the count
        currentCoachId = coachCount > 0 ? coachCount + 10 : 10;

        // Create the new coach object with the incremented coach ID
        const newCoach = {
            coachId: currentCoachId,
            coachFname: req.body.coachFname,
            coachLname: req.body.coachLname,
            coachEmail: req.body.coachEmail,
            coachPhone: parseInt(req.body.coachPhone), // Convert to number
            avatar: req.file ? req.file.filename : null, // Store the filename of the uploaded avatar
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await coachesCollection.insertOne(newCoach);

        res.status(201).send({ message: 'Coach added successfully', coachId: currentCoachId });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

async function loadCoachesCollection() {
    const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster10.jhyuynm.mongodb.net/?retryWrites=true&w=majority', {
      useNewUrlParser: true,
    });
    return client.db('perfai-new').collection('coaches');
  }
  
  module.exports = router;
