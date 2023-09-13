const express = require('express');
const { MongoClient } = require('mongodb');

const router = express.Router();

// Get Users
router.get('/', async (req, res) => {
  const users = await loadUserCollection();
  res.send(await users.find({}).toArray());
});

//Post User
router.post('/', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const users = await loadUserCollection();

  const newUser = {
    firstName,
    lastName,
    email,
    password
  };

  await users.insertOne(newUser);
  res.status(201).json({ success: true });
});


// User Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = await loadUserCollection();
  const user = await users.findOne({ email, password });

  if (user) {
    const { firstName } = user;
    res.json({ success: true, firstName });
  } else {
    res.json({ success: false });
  }
});


async function loadUserCollection() {
  const client = await MongoClient.connect('mongodb+srv://ayeshs:19970720a@cluster10.jhyuynm.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai-new').collection('user');
}

module.exports = router;
