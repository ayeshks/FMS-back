const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');


const router = express.Router();

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

// Update a club owner
router.put('/:ObjectId', async (req, res) => {
    try {
        const clubOwnerIdToUpdate = req.params.ObjectId;
        // console.log('Club Owner ID to update:', clubOwnerIdToUpdate);

        const clubownersCollection = await loadClubOwnerCollection();

        // Check if the club owner exists
        const existingClubOwner = await clubownersCollection.findOne({ _id: new ObjectId(clubOwnerIdToUpdate) });

        if (!existingClubOwner) {
            res.status(404).json({ success: false, message: 'Club Owner not found' });
            return;
        }

        // Update the club owner data
        const updatedClubOwner = {
            OfirstName: req.body.OfirstName || existingClubOwner.OfirstName,
            OlastName: req.body.OlastName || existingClubOwner.OlastName,
            email: req.body.email || existingClubOwner.email,
            phoneNumber: req.body.phoneNumber || existingClubOwner.phoneNumber,
            updatedAt: new Date(),
        };

        console.log('Updated Club Owner:', updatedClubOwner);

        // Perform the update
        const result = await clubownersCollection.updateOne(
            { _id: new ObjectId(clubOwnerIdToUpdate) },
            { $set: updatedClubOwner }
        );

        console.log('Update Result:', result);

        if (result.modifiedCount === 0) {
            res.status(404).json({ success: false, message: 'Club Owner not found' });
            return;
        }

        res.json({ success: true, message: 'Club Owner updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


async function loadClubOwnerCollection() {
  const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster10.jhyuynm.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai-new').collection('clubowner');
}


module.exports = router;
