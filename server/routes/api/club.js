const express = require('express');
const { MongoClient } = require('mongodb');
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
router.post('/',upload.single('clubavatar'), async (req, res) => {
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
    res.status(201).json({ success: true, clubId: newClub.clubOwnerId, message:'Club created successfully'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create club' });
  }
});




async function loadClubDataCollection() {
  const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster10.jhyuynm.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai-new').collection('club');
}

async function loadClubOwnersCollection() {
  const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster10.jhyuynm.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai-new').collection('clubowner');
}

module.exports = router;
