const express = require('express');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

const mongoURL = 'mongodb+srv://ayeshs:19970720a@cluster11.xgxdyvp.mongodb.net/?retryWrites=true&w=majority';
const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true };

async function loadTeamsCollection() {
  const client = await MongoClient.connect(mongoURL, mongoOptions);
  return client.db('perfai-live').collection('teams');
}

async function loadPlayersCollection() {
  const client = await MongoClient.connect(mongoURL, mongoOptions);
  return client.db('perfai-live').collection('players');
}

async function loadCoachesCollection() {
  const client = await MongoClient.connect(mongoURL, mongoOptions);
  return client.db('perfai-live').collection('coaches');
}

const router = express.Router();

// Get all teams with coach and player details
router.get('/', async (req, res) => {
  try {
    const teamsCollection = await loadTeamsCollection();

    const teamsWithData = await teamsCollection.aggregate([
      {
        $addFields: {
          // Convert coachId to ObjectId
          coachId: { $toObjectId: '$coachId' },
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
          from: 'coaches', // Replace with the actual name of your coaches collection
          localField: 'coachId',
          foreignField: '_id',
          as: 'coach',
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

    res.json(teamsWithData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to get teams data' });
  }
});



module.exports = router;
