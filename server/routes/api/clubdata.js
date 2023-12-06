const express = require('express');
const { MongoClient } = require('mongodb');

const mongoURL = 'mongodb+srv://ayeshs:19970720a@cluster11.xgxdyvp.mongodb.net/?retryWrites=true&w=majority';
const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true };

async function loadClubCollection() {
  const client = await MongoClient.connect(mongoURL, mongoOptions);
  return client.db('perfai-live').collection('club');
}

async function loadClubOwnerCollection() {
  const client = await MongoClient.connect(mongoURL, mongoOptions);
  return client.db('perfai-live').collection('clubowner');
}

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const clubCollection = await loadClubCollection();
    const clubOwnerCollection = await loadClubOwnerCollection();

    const clubDataWithOwners = await clubCollection.aggregate([
      {
        $lookup: {
          from: 'clubowner',
          localField: 'clubOwnerId',
          foreignField: 'clubOwnerId',
          as: 'clubOwner'
        }
      }
    ]).toArray();

    res.json(clubDataWithOwners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to retrieve club data' });
  }
});

module.exports = router;
