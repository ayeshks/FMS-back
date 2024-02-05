const express = require('express');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const { ObjectId } = require('mongodb'); 
const upload = require('../../../middleware/upload');
const multer = require('multer');

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


router.post('/', upload.single('Tavatar'), async (req, res) => {
  try {
    const { teamName, grade, description, coachId, playerId } = req.body;
    const teamsCollection = await loadTeamsCollection();


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
      playerId: playerIds, 
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


// Update the teams
router.put('/:objectId', upload.single('Tavatar'), async (req, res) => {
    try {
        const objectIdToUpdate = req.params.objectId;
        console.log('objectIdToUpdate:', objectIdToUpdate);

        const { teamName, grade, description, coachId, playerId } = req.body;

        const teams = await loadTeamsCollection();

        // Convert the objectId string to ObjectId
        const teamObjectId = new ObjectId(objectIdToUpdate);

        // Check if the team exists using MongoDB ObjectId
        const existingTeam = await teams.findOne({ _id: teamObjectId });


        if (!existingTeam) {
            // console.log('Team not found in the database.');
            res.status(404).json({ success: false, message: 'Team not found' });
            return;
        }

        // Update the team data
        const updatedTeam = {
            teamName: teamName || existingTeam.teamName,
            grade: grade || existingTeam.grade,
            description: description || existingTeam.description,
            coachId: coachId || existingTeam.coachId,
            playerId: playerId || existingTeam.playerId,
            Tavatar: req.file ? req.file.filename : existingTeam.Tavatar,
            updatedAt: new Date(),
      };
      
      // Ensure playerId is always an array with a single element
      updatedTeam.playerId = playerId
        ? Array.isArray(playerId)  
          ? playerId              
          : [playerId]            
        : existingTeam.playerId || []; 

        // Perform the update
        const result = await teams.updateOne(
            { _id: teamObjectId },
            { $set: updatedTeam }
        );

        if (result.modifiedCount === 0) {
            console.log('Team not found during update.');
            res.status(404).json({ success: false, message: 'Team not found' });
            return;
        }

        console.log('Team updated successfully.');
        res.json({ success: true, message: 'Team updated successfully' });
    } catch (error) {
        console.error('Error during PUT:', error);
        console.error(error.stack);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});
  
  
  async function loadTeamsCollection() {
    const client = await MongoClient.connect('mongodb+srv://chirathb:19970720a@perfai-server.wfxtufp.mongodb.net/?retryWrites=true&w=majority', {
      useNewUrlParser: true,
    });
    return client.db('perfai-server').collection('teams');
  }
  
  module.exports = router;