const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const upload = require('../../../middleware/upload');

const router = express.Router();

router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, 'uploads', filename)); // Adjust the path as needed
});

// Get all clubs
router.get('/', async (req, res) => {
    try {
      const clubDataCollection = await loadClubDataCollection();
      const clubs = await clubDataCollection.find({}).toArray();
      res.json(clubs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to get clubs' });
    }
  });
  
  let clubIdCounter = 0;
// Create a new club and link it to a club owner
router.post('/', upload.single('clubavatar'), async (req, res) => {
  try {
    const { clubName, country, description, clubOwnerId } = req.body;

    const clubDataCollection = await loadClubDataCollection();
    const clubOwnersCollection = await loadClubOwnersCollection();

    const existingClub = await clubDataCollection.findOne({ clubOwnerId });

    if (existingClub) {
      return res.status(400).json({ success: false, message: 'Club already exists for the given club owner' });
    }

    const clubOwner = await clubOwnersCollection.findOne({ clubOwnerId });
    
    if (!clubOwner) {
      return res.status(400).json({ success: false, message: 'Invalid club owner ID' });
    }

    const newClub = {
      clubId: String(++clubIdCounter),
      clubName,
      clubavatar: req.file ? req.file.filename : null,
      country,
      description,
      clubOwnerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await clubDataCollection.insertOne(newClub);

    res.status(201).json({ success: true, clubId: newClub.clubOwnerId, message: 'Club created successfully' });
  } catch (error) {
    console.error('Error creating club:', error);

    res.status(500).json({ success: false, message: 'Failed to create club' });
  }
});

// Update a club by ObjectId
router.put('/:objectId', upload.single('clubavatar'), async (req, res) => {
  try {
    const objectId = req.params.objectId;
    console.log('Updating club with objectId:', objectId);

    const { clubName, country, description } = req.body;

    if (!clubName && !country && !description && !req.file) {
      console.log('No update data provided');
      return res.status(400).json({ success: false, message: 'No update data provided' });
    }

    const clubDataCollection = await loadClubDataCollection();

    const existingClub = await clubDataCollection.findOne({ _id: new ObjectId(objectId) });

    if (!existingClub) {
      console.log('Club not found for objectId:', objectId);
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const updatedClub = {
      ...existingClub,
      clubName: clubName || existingClub.clubName,
      country: country || existingClub.country,
      description: description || existingClub.description,
      clubavatar: req.file ? req.file.filename : existingClub.clubavatar,
      updatedAt: new Date(),
    };

    const result = await clubDataCollection.updateOne(
      { _id: new ObjectId(objectId) },
      { $set: updatedClub }
    );

    if (result.matchedCount === 0) {
      console.log('Club not found for objectId:', objectId);
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    console.log('Club updated successfully for objectId:', objectId);
    res.json({ success: true, message: 'Club updated successfully' });
  } catch (error) {
    console.error('Error during club update:', error);
    res.status(500).json({ success: false, message: 'Failed to update club', error: error.message });
  }
});

// Function to load the MongoDB collection
async function loadClubDataCollection() {
  const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster11.xgxdyvp.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai-live').collection('club');
}




async function loadClubDataCollection() {
  const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster11.xgxdyvp.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai-live').collection('club');
}

async function loadClubOwnersCollection() {
  const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster11.xgxdyvp.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai-live').collection('clubowner');
}

module.exports = router;
