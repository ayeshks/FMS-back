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

  router.post('/', upload.single('Map'), async (req, res) => {
    try {
      const { sessionName, Stype, tags, playerId } = req.body;
      const sessionCollection = await loadSessionCollection();
  
   
      const sessionCount = await sessionCollection.countDocuments();
      const currentSessionId = sessionCount > 0 ? sessionCount + 1 : 1;
  
      // Assuming playerId is provided as an array of player IDs in the request body
      const playerIds = Array.isArray(playerId) ? playerId : [playerId];
  
      const newSession = {
        sessionId: String(currentSessionId),
        sessionName,
        Stype,
        Map: req.file ? req.file.filename : null,
        tags,
        playerId: playerIds, 
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

    
  async function loadSessionCollection() {
    const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster10.jhyuynm.mongodb.net/?retryWrites=true&w=majority', {
      useNewUrlParser: true,
    });
    return client.db('perfai-new').collection('session');
  }
  
  module.exports = router;