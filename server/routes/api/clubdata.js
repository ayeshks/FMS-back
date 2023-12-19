const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

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

router.get('/:ObjectId', async (req, res) => {
  try {
    const objectIdParam = req.params.ObjectId;
    const clubCollection = await loadClubCollection();

    const clubDataWithOwners = await clubCollection.aggregate([
      {
        $match: { _id: new ObjectId(objectIdParam) }
      },
      {
        $lookup: {
          from: 'clubowner',
          localField: 'clubOwnerId',
          foreignField: 'clubOwnerId',
          as: 'clubOwner'
        }
      }
    ]).toArray();

    if (clubDataWithOwners.length === 0) {
      res.status(404).json({ message: 'Club not found' });
      return;
    }

    // Assuming you want to return the first element of the array (should be unique due to the match on _id)
    const clubData = clubDataWithOwners[0];
    res.json({
      _id: clubData._id,
      clubId: clubData.clubId,
      clubName: clubData.clubName,
      clubavatar: clubData.clubavatar,
      country: clubData.country,
      description: clubData.description,
      clubOwnerId: clubData.clubOwnerId,
      createdAt: clubData.createdAt,
      updatedAt: clubData.updatedAt,
      clubOwner: clubData.clubOwner // Include club owner details
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


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
