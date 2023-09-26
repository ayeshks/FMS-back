const express = require('express');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb'); 
const upload = require('../../../middleware/upload');
const multer = require('multer'); // If you need to handle file uploads

const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const teamsCollection = await loadTeamsCollection();
      const teams = await teamsCollection.find({}).toArray();
      res.json(teams);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to get clubs' });
    }
  });

// let currentTeamId = 0;

router.post('/', upload.single('Tavatar'), async (req, res) => {
  try {
    const { teamName, grade, description, coachId, playerId } = req.body;
    const teamsCollection = await loadTeamsCollection();

    // You can add additional validation here to ensure coachId and playerId are valid

    // Calculate the next team ID based on the existing teams
    const teamCount = await teamsCollection.countDocuments();
    const currentTeamId = teamCount > 0 ? teamCount + 1 : 1;

    // Assuming playerId is provided as an array of player IDs in the request body
    const playerIds = Array.isArray(playerId) ? playerId : [playerId];

    const newTeam = {
      teamId: String(currentTeamId),
      teamName,
      grade,
      Tavatar: req.file ? req.file.filename : null,
      description,
      coachId,
      playerId: playerIds, // Store the player IDs as an array
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await teamsCollection.insertOne(newTeam);
    res.status(201).json({ success: true, teamId: newTeam.teamId, message: 'Team created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create team' });
  }
});


  
  
  async function loadTeamsCollection() {
    const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster10.jhyuynm.mongodb.net/?retryWrites=true&w=majority', {
      useNewUrlParser: true,
    });
    return client.db('perfai-new').collection('teams');
  }
  
  module.exports = router;