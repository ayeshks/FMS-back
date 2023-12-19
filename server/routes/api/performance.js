const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
// Import the upload middleware
// const upload = require('../../../middleware/upload');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const performance = await loadPerformanceCollection();
      const performances = await performance .find({}).toArray();
      res.json(performances);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to get iot device details' });
    }
  });

  let currentPerId = 10;

  router.post('/',  async (req, res) => {
    try {
      const performancesCollection = await loadPerformanceCollection();
      const performanceCount = await performancesCollection.countDocuments();
      currentPerId = performanceCount > 0 ? performanceCount + 10 : 10;
  
      const newPerformance = {
        PerId: currentPerId,
        BPM: req.body.BPM,
        Distance: req.body.Distance,
        Sprints: req.body.Sprints,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      const result = await performancesCollection.insertOne(newPerformance);
      res.status(201).send({ message: 'Performance added successfully', PerId: currentPerId });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  



  async function loadPerformanceCollection() {
    const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster11.xgxdyvp.mongodb.net/?retryWrites=true&w=majority', {
        useNewUrlParser: true,
    });
    return client.db('perfai-live').collection('Performance');
}
  
  module.exports = router;