const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const upload = require('../../../middleware/upload');
const fs = require('fs');


const router = express.Router();

// Function to connect to AWS DocumentDB
async function connectToDocumentDB() {
  try {
    const pemFilePath = '/Users/appleasia/Documents/perfai-server/perfai-server/global-bundle.pem'; // Adjusted path
    const pemFileContent = fs.readFileSync(pemFilePath);

    const client = await MongoClient.connect('mongodb://perfai:19970720a@docdb-2023-09-26-11-29-23.cluster-cs5od4y8mtq1.ap-south-1.docdb.amazonaws.com:27017/?tls=true&tlsCAFile=' + pemFilePath + '&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    return client;
  } catch (error) {
    console.error('Error connecting to DocumentDB:', error);
    throw error;
  }
}


// Function to load the MongoDB collection for club owners
async function loadClubOwnerCollection() {
  const client = await connectToDocumentDB();
  return client.db('perfai-new').collection('clubowner');
}

// Get a specific club owner by ObjectId
router.get('/:ObjectId', async (req, res) => {
  try {
    const objectIdParam = req.params.ObjectId;
    const clubowners = await loadClubOwnerCollection();
    const owner = await clubowners.findOne({ _id: new ObjectId(objectIdParam) });

    if (!owner) {
      res.status(404).json({ message: 'Club owner not found' });
      return;
    }

    res.json(owner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Get all club owners
router.get('/', async (req, res) => {
    try {
      const clubowners = await loadClubOwnerCollection();
      const owners = await clubowners.find({}).toArray();
      res.json(owners);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to get club owners' });
    }
});
  


// Create a new club owner
router.post('/', async (req, res) => {
  try {
    const { OfirstName, OlastName, email, phoneNumber } = req.body;
    const clubowners = await loadClubOwnerCollection();

    // Get the count of existing club owners
    const count = await clubowners.countDocuments();

    const clubOwnerId = `100${count + 1}`; // Generate the club owner ID

    const newClubOwner = {
      clubOwnerId,
      OfirstName,
      OlastName,
      email,
      phoneNumber
    };

    await clubowners.insertOne(newClubOwner);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create club owner' });
  }
});

// Update a club owner by clubOwnerId
router.put('/:clubOwnerId', upload.single('clubavatar'), async (req, res) => {
  try {
    const clubOwnerId = req.params.clubOwnerId;
    console.log('Updating club owner with clubOwnerId:', clubOwnerId);

    const { OfirstName, OlastName, email, phoneNumber } = req.body;

    if (!OfirstName && !OlastName && !email && !phoneNumber) {
      console.log('No update data provided');
      return res.status(400).json({ success: false, message: 'No update data provided' });
    }

    const clubOwnersCollection = await loadClubOwnerCollection();

    // Find the existing club owner
    const existingClubOwner = await clubOwnersCollection.findOne({ clubOwnerId: clubOwnerId });

    if (!existingClubOwner) {
      console.log('Club owner not found for clubOwnerId:', clubOwnerId);
      return res.status(404).json({ success: false, message: 'Club owner not found' });
    }

    // Create the updatedClubOwner object by spreading existingClubOwner and updating specified properties
    const updatedClubOwner = {
      ...existingClubOwner,
      OfirstName: OfirstName || existingClubOwner.OfirstName,
      OlastName: OlastName || existingClubOwner.OlastName,
      email: email || existingClubOwner.email,
      phoneNumber: phoneNumber || existingClubOwner.phoneNumber,
    };

    // Perform the update in the database
    const result = await clubOwnersCollection.updateOne(
      { clubOwnerId: clubOwnerId },
      { $set: updatedClubOwner }
    );

    if (result.matchedCount === 0) {
      console.log('Club owner not found for clubOwnerId:', clubOwnerId);
      return res.status(404).json({ success: false, message: 'Club owner not found' });
    }

    console.log('Club owner updated successfully for clubOwnerId:', clubOwnerId);
    res.json({ success: true, message: 'Club owner updated successfully' });
  } catch (error) {
    console.error('Error during club owner update:', error);
    res.status(500).json({ success: false, message: 'Failed to update club owner', error: error.message });
  }
});

// Delete a club owner by ObjectId
router.delete('/:objectId', async (req, res) => {
  try {
    const objectId = req.params.objectId;
    console.log('Deleting club owner with objectId:', objectId);

    const clubOwnersCollection = await loadClubOwnerCollection();

    const result = await clubOwnersCollection.deleteOne({ _id: new ObjectId(objectId) });

    if (result.deletedCount === 0) {
      console.log('Club owner not found for objectId:', objectId);
      return res.status(404).json({ success: false, message: 'Club owner not found' });
    }

    console.log('Club owner deleted successfully for objectId:', objectId);
    res.json({ success: true, message: 'Club owner deleted successfully' });
  } catch (error) {
    console.error('Error during club owner deletion:', error);
    res.status(500).json({ success: false, message: 'Failed to delete club owner', error: error.message });
  }
});






async function loadClubOwnerCollection() {
  const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster11.xgxdyvp.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai-live').collection('clubowner');
}


module.exports = router;
