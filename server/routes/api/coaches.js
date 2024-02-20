const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const path = require('path'); 
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer'); 

const router = express.Router();
const upload = multer(); 

// Connection URI
const uri = 'mongodb+srv://chirathb:19970720a@cluster0.axxkews.mongodb.net/?retryWrites=true&w=majority';

// Create a new MongoClient
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Set up AWS S3 client
const s3Client = new S3Client({
  region: 'ap-south-1',
  credentials: {
    accessKeyId: 'AKIAYBYPZNYKJFFJJOV7',
    secretAccessKey: '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',
  },
});

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory to access buffer
const multerUpload = multer({ storage: storage }); // Rename 'upload' variable

// Connect to MongoDB
client.connect(err => {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
    return;
  }
  console.log('Connected to MongoDB');
});

// Load map collection
async function loadCoachesCollection() {
  return client.db('perfai-new').collection('coaches');
}

router.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(path.join(__dirname, 'uploads', filename)); // Adjust the path as needed
});

// GET route to retrieve coaches data from MongoDB
router.get('/', async (req, res) => {
  try {
    const coachesCollection = await loadCoachesCollection();
    const coachesData = await coachesCollection.find({}).toArray();
    res.json(coachesData);
  } catch (error) {
    console.error('Error retrieving coaches data from MongoDB:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:ObjectId', async (req, res) => {
  try {
    const objectIdParam = req.params.ObjectId;
    const coachesCollection = await loadCoachesCollection(); // Replace with your function to load the coaches collection
    const coachData = await coachesCollection.findOne({ _id: new ObjectId(objectIdParam) });

    if (!coachData) {
      res.status(404).json({ message: 'Coach not found' });
      return;
    }

    res.json(coachData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/', multerUpload.single('avatar'), async (req, res) => { // Use 'multerUpload' instead of 'upload'
  try {
    // Ensure required fields are present in the request
    const { coachFname, coachLname, coachEmail, coachPhone } = req.body;
    const avatar = req.file;

    if (!avatar) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload file to S3
    const s3Params = {
      Bucket: 'perfaienv', // Replace with your S3 bucket name
      Key: new ObjectId().toString(), // Generate unique ObjectId
      Body: avatar.buffer,
      ContentType: avatar.mimetype,
      ACL: 'public-read', 
    };

    // Send the file to S3
    const s3UploadResult = await s3Client.send(new PutObjectCommand(s3Params));

    if (!s3UploadResult) {
      throw new Error('Failed to upload file to S3');
    }

    // Insert data into MongoDB with S3 key reference
    const coachesCollection = await loadCoachesCollection();
    const result = await coachesCollection.insertOne({
      coachFname,
      coachLname,
      coachEmail,
      coachPhone: parseInt(coachPhone), // Convert to number
      avatarId: s3Params.Key, // Store S3 key as avatarId
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ message: 'Coach added successfully', coachId: result.insertedId });
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update a coach
router.put('/:objectId', upload.single('avatar'), async (req, res) => {
    try {
        const coachIdToUpdate = req.params.objectId;

        const coachesCollection = await loadCoachesCollection();

        // Check if the coach exists
        const existingCoach = await coachesCollection.findOne({ _id: new ObjectId(coachIdToUpdate) });

        if (!existingCoach) {
            res.status(404).json({ success: false, message: 'Coach not found' });
            return;
        }

        // Update the coach data
        const updatedCoach = {
            coachFname: req.body.coachFname || existingCoach.coachFname,
            coachLname: req.body.coachLname || existingCoach.coachLname,
            coachEmail: req.body.coachEmail || existingCoach.coachEmail,
            coachPhone: req.body.coachPhone || existingCoach.coachPhone,
            avatar: req.file ? req.file.filename : existingCoach.avatar,
        };

        console.log('Updated Coach:', updatedCoach);

        // Perform the update
        const result = await coachesCollection.updateOne(
            { _id: new ObjectId(coachIdToUpdate) },
            { $set: updatedCoach }
        );

        console.log('Update Result:', result);

        if (result.modifiedCount === 0) {
            res.status(404).json({ success: false, message: 'Coach not found' });
            return;
        }

        res.json({ success: true, message: 'Coach updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Delete a coach by ObjectId
router.delete('/:objectId', async (req, res) => {
    try {
      const objectIdToDelete = req.params.objectId;
      console.log('Deleting coach with ObjectId:', objectIdToDelete);
  
      const coachesCollection = await loadCoachesCollection();
  
      const result = await coachesCollection.deleteOne({ _id: new ObjectId(objectIdToDelete) });
  
      if (result.deletedCount === 0) {
        console.log('Coach not found for ObjectId:', objectIdToDelete);
        return res.status(404).json({ success: false, message: 'Coach not found' });
      }
  
      console.log('Coach deleted successfully for ObjectId:', objectIdToDelete);
      res.json({ success: true, message: 'Coach deleted successfully' });
    } catch (error) {
      console.error('Error during coach deletion:', error);
      res.status(500).json({ success: false, message: 'Failed to delete coach', error: error.message });
    }
  });
  
async function loadCoachesCollection() {
  const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster11.xgxdyvp.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai-live').collection('coaches');
}

module.exports = router;