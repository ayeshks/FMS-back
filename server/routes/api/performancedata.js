const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const router = express.Router();

async function loadPerformanceCollection() {
  const client = await MongoClient.connect('mongodb+srv://chirathb:19970720a@perfai-server.wfxtufp.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai-server').collection('Performance');
}

async function loadIotCollection() {
  const client = await MongoClient.connect('mongodb+srv://chirathb:19970720a@perfai-server.wfxtufp.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai-server').collection('iot');
}

async function loadPlayersCollection() {
  const client = await MongoClient.connect('mongodb+srv://chirathb:19970720a@perfai-server.wfxtufp.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai-server').collection('Players');
}

router.get('/', async (req, res) => {
  try {
    const performancesCollection = await loadPerformanceCollection();
    const iotCollection = await loadIotCollection();
    const playersCollection = await loadPlayersCollection();

    const performanceData = await performancesCollection.aggregate([
      {
        $addFields: {
          playerId: { $toObjectId: '$playerId' },
          iotId: { $toObjectId: '$iotId' },
        },
      },
      {
        $lookup: {
          from: 'Players', 
          localField: 'playerId',
          foreignField: '_id',
          as: 'player',
        },
      },
      {
        $lookup: {
          from: 'iot',
          localField: 'iotId',
          foreignField: '_id',
          as: 'iot',
        },
      },
    ]).toArray();

    res.json(performanceData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to get performance data' });
  }
});

module.exports = router;
