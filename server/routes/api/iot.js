const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
// Import the upload middleware
const upload = require('../../../middleware/upload');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const iot = await loadIotCollection();
      const iots = await iot.find({}).toArray();
      res.json(iots);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to get iot device details' });
    }
  });

  let currentIotId = 10;

  router.post('/', upload.single('Iavatar'), async (req, res) => {
    try {
      const iotsCollection = await loadIotCollection();
      const iotCount = await iotsCollection.countDocuments();
      currentIotId = iotCount > 0 ? iotCount + 10 : 10;
  
      const newIot = {
        IotId: currentIotId,
        Iavatar: req.file ? req.file.filename : null,
        DeviceType: req.body.DeviceType,
        SerialNumber: req.body.SerialNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      const result = await iotsCollection.insertOne(newIot);
      res.status(201).send({ message: 'Player added successfully', iotId: currentIotId });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  



  async function loadIotCollection() {
    const client = await MongoClient.connect('mongodb+srv://chirathb:19970720a@cluster0.axxkews.mongodb.net/?retryWrites=true&w=majority', {
        useNewUrlParser: true,
    });
    return client.db('perfai-live').collection('iot');
}
  
  module.exports = router;