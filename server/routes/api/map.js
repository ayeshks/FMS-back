const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const map = await loadMapCollection();
      const maps = await map.find({}).toArray();
      res.json(maps);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to get map' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const { PitchN, PitchT, PLength, PWidth } = req.body;
      const maps = await loadMapCollection();
  
      
      const count = await maps.countDocuments();
  
      const mapId = `1${count + 1}`; 
  
      const newMap = {
        mapId,
        PitchN,
        PitchT,
        PLength,
        PWidth
      };
  
      await maps.insertOne(newMap);
      res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to create map' });
    }
  });

// Update the map
router.put('/:objectId', async (req, res) => {
    try {
        const objectIdToUpdate = req.params.objectId;
        console.log('objectIdToUpdate:', objectIdToUpdate);

        const { PitchN, PitchT, PLength, PWidth } = req.body;

        const maps = await loadMapCollection();

        // Convert the objectId string to ObjectId
        const mapObjectId = new ObjectId(objectIdToUpdate);

        // Check if the map exists using MongoDB ObjectId
        const existingMap = await maps.findOne({ _id: mapObjectId });

        if (!existingMap) {
            console.log('Map not found in the database.');
            res.status(404).json({ success: false, message: 'Map not found' });
            return;
        }

        // Update the map data
        const updatedMap = {
            PitchN: PitchN || existingMap.PitchN,
            PitchT: PitchT || existingMap.PitchT,
            PLength: PLength || existingMap.PLength,
            PWidth: PWidth || existingMap.PWidth,
        };

        // Perform the update
        const result = await maps.updateOne(
            { _id: mapObjectId },
            { $set: updatedMap }
        );

        if (result.modifiedCount === 0) {
            console.log('Map not found during update.');
            res.status(404).json({ success: false, message: 'Map not found' });
            return;
        }

        console.log('Map updated successfully.');
        res.json({ success: true, message: 'Map updated successfully' });
    } catch (error) {
        console.error('Error during PUT:', error);
        console.error(error.stack);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

async function loadMapCollection() {
    const client = await MongoClient.connect('mongodb+srv://chirathb:19970720a@perfai-server.wfxtufp.mongodb.net/?retryWrites=true&w=majority', {
        useNewUrlParser: true,
    });
    return client.db('perfai-server').collection('map');
}
  
  module.exports = router;