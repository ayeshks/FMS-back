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
          coachId: { $toObjectId: '$coachId' },
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
          from: 'coaches', 
          localField: 'coachId',
          foreignField: '_id',
          as: 'coach',
        },
      },
      {
        $lookup: {
          from: 'Players', 
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

router.get('/:ObjectId', async (req, res) => {
  try {
    const objectIdParam = req.params.ObjectId;
    const teamsCollection = await loadTeamsCollection();

    const teamWithData = await teamsCollection.aggregate([
      {
        $match: { _id: new ObjectId(objectIdParam) }
      },
      {
        $addFields: {
          coachId: { $toObjectId: '$coachId' },
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
          from: 'coaches',
          localField: 'coachId',
          foreignField: '_id',
          as: 'coach',
        },
      },
      {
          $lookup: {
            from: 'Players',
            localField: 'playerId',
            foreignField: '_id',
            as: 'Players',
          },
        },
    ]).toArray();

    if (teamWithData.length === 0) {
      console.log(`Team with ID ${objectIdParam} not found`);
      res.status(404).json({ message: 'Team not found' });
      return;
    }

    const teamData = teamWithData[0];

    console.log('Team with Data:', teamData);
    res.json(teamData);
  } catch (error) {
    console.error('Error fetching team data:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.delete('/:ObjectId', async (req, res) => {
  try {
    const objectIdParam = req.params.ObjectId;
    const teamsCollection = await loadTeamsCollection();

    const result = await teamsCollection.deleteOne({ _id: new ObjectId(objectIdParam) });

    if (result.deletedCount === 0) {
      console.log(`Team with ID ${objectIdParam} not found for deletion`);
      res.status(404).json({ message: 'Team not found for deletion' });
      return;
    }

    console.log(`Team with ID ${objectIdParam} deleted successfully`);
    res.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});




module.exports = router;
