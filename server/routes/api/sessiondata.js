const express = require('express');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

const mongoURL = 'mongodb+srv://ayeshs:19970720a@cluster10.jhyuynm.mongodb.net/?retryWrites=true&w=majority';
const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true };

async function loadSessionCollection() {
  const client = await MongoClient.connect(mongoURL, mongoOptions);
  return client.db('perfai-new').collection('session');
}

async function loadPlayersCollection() {
  const client = await MongoClient.connect(mongoURL, mongoOptions);
  return client.db('perfai-new').collection('players');
}

async function loadMapCollection() {
  const client = await MongoClient.connect(mongoURL, mongoOptions);
  return client.db('perfai-new').collection('map');
}

const router = express.Router();

// Get all teams with coach and player details
router.get('/', async (req, res) => {
  try {
    const sessionCollection = await loadSessionCollection();

    const sessionWithData = await sessionCollection.aggregate([
      {
        $addFields: {
          // Convert coachId to ObjectId
          mapId: { $toObjectId: '$mapId' },
          // Convert playerId array to an array of ObjectId
          playerId: {
            $map: {
              input: '$playerId',
              as: 'playerId',
              in: { $toObjectId: '$$playerId' },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'map', // Replace with the actual name of your coaches collection
          localField: 'mapId',
          foreignField: '_id',
          as: 'map',
        },
      },
      {
        $lookup: {
          from: 'Players', // Replace with the actual name of your players collection
          localField: 'playerId',
          foreignField: '_id',
          as: 'Players',
        },
      },
    ]).toArray();

    res.json(sessionWithData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to get teams data' });
  }
});



module.exports = router;
