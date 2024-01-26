const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
// Import the upload middleware
const upload = require('../../../middleware/upload');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.get('/:ObjectId', async (req, res) => {
    try {
        const objectIdParam = req.params.ObjectId;
        const iotCollection = await loadIotCollection();
        const iotData = await iotCollection.findOne({ _id: new ObjectId(objectIdParam) });

        if (!iotData) {
            res.status(404).json({ message: 'IoT device not found' });
            return;
        }

        res.json(iotData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

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
        PlayerId: req.body.PlayerId,
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

  //Update IOT
  router.put('/:ObjectId', upload.single('Iavatar'), async (req, res) => {
    try {
        const objectIdToUpdate = req.params.ObjectId;
        const iotsCollection = await loadIotCollection();

        const existingIot = await iotsCollection.findOne({ _id: new ObjectId(objectIdToUpdate) });

        if (!existingIot) {
            res.status(404).json({ message: 'IoT device not found' });
            return;
        }

        const updatedIot = {
            Iavatar: req.file ? req.file.filename : existingIot.Iavatar,
            DeviceType: req.body.DeviceType || existingIot.DeviceType,
            SerialNumber: req.body.SerialNumber || existingIot.SerialNumber,
            PlayerId: req.body.PlayerId || existingIot.PlayerId,
            updatedAt: new Date(),
        };

        const result = await iotsCollection.updateOne(
            { _id: new ObjectId(objectIdToUpdate) },
            { $set: updatedIot }
        );

        console.log('Update Result:', result);

        if (result.modifiedCount === 0) {
            res.status(404).json({ message: 'IoT device not found' });
            return;
        }

        res.json({ message: 'IoT device updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
  



  async function loadIotCollection() {
    const client = await MongoClient.connect('mongodb+srv://chirathb:19970720a@cluster0.axxkews.mongodb.net/?retryWrites=true&w=majority', {
        useNewUrlParser: true,
    });
    return client.db('perfai-new').collection('iot');
}
  
  module.exports = router;