const express = require('express');
const { MongoClient } = require('mongodb');
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

async function loadMapCollection() {
    const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster10.jhyuynm.mongodb.net/?retryWrites=true&w=majority', {
      useNewUrlParser: true,
    });
    return client.db('perfai-new').collection('map');
  }
  
  module.exports = router;