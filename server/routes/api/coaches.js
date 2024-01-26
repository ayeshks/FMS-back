const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const upload = require('../../../middleware/upload');
const path = require('path'); // Import the path module for file operations

const router = express.Router();

router.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(path.join(__dirname, 'uploads', filename)); // Adjust the path as needed
});

router.get('/:ObjectId', async (req, res) => {
  try {
    const objectIdParam = req.params.ObjectId;
    const coachesCollection = await loadCoachesCollection(); // Replace with your function to load the coaches collection
    const coachData = await coachesCollection.findOne({ _id: new ObjectId(objectIdParam) });

    if (!coachData) {
      res.status(404).json({ message: 'Coach not found' });
      return;
    }

    res.json(coachData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Get coaches
router.get('/', async (req, res) => {
    try {
        const coachesCollection = await loadCoachesCollection();
        const coachesData = await coachesCollection.find({}).toArray();

        res.send(coachesData);
    } catch (error) {
        console.error('GET /coaches Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add Coach
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


// Update a coach
router.put('/:objectId', upload.single('avatar'), async (req, res) => {
    try {
        const coachIdToUpdate = req.params.objectId;

        const coachesCollection = await loadCoachesCollection();

        // Check if the coach exists
        const existingCoach = await coachesCollection.findOne({ _id: new ObjectId(coachIdToUpdate) });

        if (!existingCoach) {
            res.status(404).json({ success: false, message: 'Coach not found' });
            return;
        }

        // Update the coach data
        const updatedCoach = {
            coachFname: req.body.coachFname || existingCoach.coachFname,
            coachLname: req.body.coachLname || existingCoach.coachLname,
            coachEmail: req.body.coachEmail || existingCoach.coachEmail,
            coachPhone: req.body.coachPhone || existingCoach.coachPhone,
            avatar: req.file ? req.file.filename : existingCoach.avatar,
        };

        console.log('Updated Coach:', updatedCoach);

        // Perform the update
        const result = await coachesCollection.updateOne(
            { _id: new ObjectId(coachIdToUpdate) },
            { $set: updatedCoach }
        );

        console.log('Update Result:', result);

        if (result.modifiedCount === 0) {
            res.status(404).json({ success: false, message: 'Coach not found' });
            return;
        }

        res.json({ success: true, message: 'Coach updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Delete a coach by ObjectId
router.delete('/:objectId', async (req, res) => {
    try {
      const objectIdToDelete = req.params.objectId;
      console.log('Deleting coach with ObjectId:', objectIdToDelete);
  
      const coachesCollection = await loadCoachesCollection();
  
      const result = await coachesCollection.deleteOne({ _id: new ObjectId(objectIdToDelete) });
  
      if (result.deletedCount === 0) {
        console.log('Coach not found for ObjectId:', objectIdToDelete);
        return res.status(404).json({ success: false, message: 'Coach not found' });
      }
  
      console.log('Coach deleted successfully for ObjectId:', objectIdToDelete);
      res.json({ success: true, message: 'Coach deleted successfully' });
    } catch (error) {
      console.error('Error during coach deletion:', error);
      res.status(500).json({ success: false, message: 'Failed to delete coach', error: error.message });
    }
  });
  
async function loadCoachesCollection() {
  const client = await MongoClient.connect('mongodb+srv://chirathb:19970720a@cluster0.axxkews.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai-new').collection('coaches');
}

module.exports = router;
