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

// router.get('/:ObjectId', async (req, res) => {
//     try {
//         const objectIdParam = req.params.ObjectId;
//         const playersCollection = await loadPlayersCollection();
//         const playerData = await playersCollection.findOne({ _id: new ObjectId(objectIdParam) });

//         if (!playerData) {
//             res.status(404).json({ message: 'Player not found' });
//             return;
//         }

//         res.json(playerData);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });


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

// Update Player
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



async function loadPlayersCollection() {
  const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster10.jhyuynm.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai-new').collection('Players');
}

module.exports = router;
