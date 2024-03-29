const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
// Import the upload middleware
const upload = require('../../../middleware/upload');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();


router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(path.join(__dirname, 'uploads', filename)); // Adjust the path as needed
});

router.get('/:ObjectId', async (req, res) => {
    try {
        const objectIdParam = req.params.ObjectId;
        const playersCollection = await loadPlayersCollection();
        const playerData = await playersCollection.findOne({ _id: new ObjectId(objectIdParam) });

        if (!playerData) {
            res.status(404).json({ message: 'Player not found' });
            return;
        }

        res.json(playerData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


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

let currentPlayerId = 10;

router.post('/', upload.single('Pavatar'), async (req, res) => {
  try {
    // Ensure required fields are present in the request
    const requiredFields = ['PFname', 'PLname', 'PEmail', 'PNumber','PAge', 'PHeight', 'PWeight', 'PField', 'PJursey', 'DeviceType', 'SerialNumber'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).send(`Missing required field: ${field}`);
      }
    }
    const playersCollection = await loadPlayersCollection();
    const playerCount = await playersCollection.countDocuments();
    currentPlayerId = playerCount > 0 ? playerCount + 10 : 10;

    const newPlayer = {
      playerId: currentPlayerId,
      PFname: req.body.PFname,
      PLname: req.body.PLname,
      PEmail: req.body.PEmail,
      PNumber: parseInt(req.body.PNumber),
      Pavatar: req.file ? req.file.filename : null,
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

    const result = await playersCollection.insertOne(newPlayer);
    res.status(201).send({ message: 'Player added successfully', playerId: currentPlayerId });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// //Update Player
// router.put('/:playerId', upload.single('Pavatar'), async (req, res) => {
//     try {
//         const playerIdToUpdate = req.params.playerId;
//         console.log('PlayerId to update:', playerIdToUpdate);

//         const playersCollection = await loadPlayersCollection();
        
//         const existingPlayer = await playersCollection.findOne({ _id: new ObjectId(playerIdToUpdate) });

//         if (!existingPlayer) {
//             res.status(404).json({ message: 'Player not found' });
//             return;
//         }

//         const updatedPlayer = {
//             PFname: req.body.PFname || existingPlayer.PFname,
//             PLname: req.body.PLname || existingPlayer.PLname,
//             PEmail: req.body.PEmail || existingPlayer.PEmail,
//             PNumber: parseInt(req.body.PNumber) || existingPlayer.PNumber,
//             Pavatar: req.file ? req.file.filename : existingPlayer.Pavatar,
//             PAge: req.body.PAge || existingPlayer.PAge,
//             PHeight: req.body.PHeight || existingPlayer.PHeight,
//             PWeight: req.body.PWeight || existingPlayer.PWeight,
//             PField: req.body.PField || existingPlayer.PField,
//             PJursey: req.body.PJursey || existingPlayer.PJursey,
//             DeviceType: req.body.DeviceType || existingPlayer.DeviceType,
//             SerialNumber: req.body.SerialNumber || existingPlayer.SerialNumber,
//             updatedAt: new Date(),
//         };

//         console.log('Updated Player:', updatedPlayer);

//         const result = await playersCollection.updateOne(
//             { _id: new ObjectId(playerIdToUpdate) },
//             { $set: updatedPlayer }
//         );

//         console.log('Update Result:', result);

//         if (result.modifiedCount === 0) {
//             res.status(404).json({ message: 'Player not found' });
//             return;
//         }

//         res.json({ message: 'Player updated successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });


router.put('/:ObjectId', upload.single('Pavatar'), async (req, res) => {
    try {
        const objectIdToUpdate = req.params.ObjectId;
        // console.log('ObjectId to update:', objectIdToUpdate);

        const playersCollection = await loadPlayersCollection();
        
        const existingPlayer = await playersCollection.findOne({ _id: new ObjectId(objectIdToUpdate) });

        if (!existingPlayer) {
            res.status(404).json({ message: 'Player not found' });
            return;
        }

        const updatedPlayer = {
            PFname: req.body.PFname || existingPlayer.PFname,
            PLname: req.body.PLname || existingPlayer.PLname,
            PEmail: req.body.PEmail || existingPlayer.PEmail,
            PNumber: parseInt(req.body.PNumber) || existingPlayer.PNumber,
            Pavatar: req.file ? req.file.filename : existingPlayer.Pavatar,
            PAge: req.body.PAge || existingPlayer.PAge,
            PHeight: req.body.PHeight || existingPlayer.PHeight,
            PWeight: req.body.PWeight || existingPlayer.PWeight,
            PField: req.body.PField || existingPlayer.PField,
            PJursey: req.body.PJursey || existingPlayer.PJursey,
            DeviceType: req.body.DeviceType || existingPlayer.DeviceType,
            SerialNumber: req.body.SerialNumber || existingPlayer.SerialNumber,
            updatedAt: new Date(),
        };

        const result = await playersCollection.updateOne(
            { _id: new ObjectId(objectIdToUpdate) },
            { $set: updatedPlayer }
        );

        console.log('Update Result:', result);

        if (result.modifiedCount === 0) {
            res.status(404).json({ message: 'Player not found' });
            return;
        }

        res.json({ message: 'Player updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Delete a player by ObjectId
router.delete('/:ObjectId', async (req, res) => {
  try {
    const objectIdToDelete = req.params.ObjectId;
    console.log('Deleting player with ObjectId:', objectIdToDelete);

    const playersCollection = await loadPlayersCollection();

    const result = await playersCollection.deleteOne({ _id: new ObjectId(objectIdToDelete) });

    if (result.deletedCount === 0) {
      console.log('Player not found for ObjectId:', objectIdToDelete);
      return res.status(404).json({ success: false, message: 'Player not found' });
    }

    console.log('Player deleted successfully for ObjectId:', objectIdToDelete);
    res.json({ success: true, message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error during player deletion:', error);
    res.status(500).json({ success: false, message: 'Failed to delete player', error: error.message });
  }
});



async function loadPlayersCollection() {
  const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster11.xgxdyvp.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai-live').collection('Players');
}

module.exports = router;
