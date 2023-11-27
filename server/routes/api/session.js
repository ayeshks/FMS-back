const express = require('express');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb'); 
const upload = require('../../../middleware/upload');
const multer = require('multer'); // If you need to handle file uploads

const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const sessionCollection = await loadSessionCollection();
      const session = await sessionCollection.find({}).toArray();
      res.json(session);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to get clubs' });
    }
  });

  router.post('/', upload.single('sessionAvatar'), async (req, res) => {
    try {
      const { sessionName, Stype, tags,mapId,playerId} = req.body;
      const sessionCollection = await loadSessionCollection();
  
   
      const sessionCount = await sessionCollection.countDocuments();
      const currentSessionId = sessionCount > 0 ? sessionCount + 1 : 1;
  
      // Assuming playerId is provided as an array of player IDs in the request body
      const playerIds = Array.isArray(playerId) ? playerId : [playerId];
  
      const newSession = {
        sessionId: String(currentSessionId),
        sessionName,
        Stype,
        mapId,
        tags,
        playerId: playerIds, 
        sessionAvatar: req.file ? req.file.filename : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      await sessionCollection.insertOne(newSession);
      res.status(201).json({ success: true, sessionId: newSession.sessionId, message: 'Session created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to create Session' });
    }
  });

// Update the session
router.put('/:objectId', upload.single('sessionAvatar'), async (req, res) => {
    try {
        const objectIdToUpdate = req.params.objectId;
        // console.log('objectIdToUpdate:', objectIdToUpdate);
        // console.log('req.body:', req.body);

        const { sessionName, Stype, tags, mapId, playerId } = req.body;

        const sessionCollection = await loadSessionCollection();

        // Check if the session exists using MongoDB ObjectId
        const existingSession = await sessionCollection.findOne({ _id: new ObjectId(objectIdToUpdate) });

        console.log('Existing Session:', existingSession);

        if (!existingSession) {
            console.log('Session not found in the database.');
            res.status(404).json({ success: false, message: 'Session not found' });
            return;
        }

        // Update the session data
        const updatedSession = {
            sessionName: sessionName || existingSession.sessionName,
            Stype: Stype || existingSession.Stype,
            tags: tags || existingSession.tags,
            mapId: mapId || existingSession.mapId,
            playerId: playerId || existingSession.playerId,
            sessionAvatar: req.file ? req.file.filename : existingSession.sessionAvatar,
            updatedAt: new Date(),
        };

        // Perform the update
        const result = await sessionCollection.updateOne(
            { _id: new ObjectId(objectIdToUpdate) },
            { $set: updatedSession }
        );

        if (result.modifiedCount === 0) {
            console.log('Session not found during update.');
            res.status(404).json({ success: false, message: 'Session not found' });
            return;
        }

        console.log('Session updated successfully.');
        res.json({ success: true, message: 'Session updated successfully' });
    } catch (error) {
        console.error('Error during PUT:', error);
        console.error(error.stack);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


async function loadSessionCollection() {
    const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster10.jhyuynm.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    });
    return client.db('perfai-new').collection('session');
}

module.exports = router;