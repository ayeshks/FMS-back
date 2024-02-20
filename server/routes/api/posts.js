const express = require('express');
const { MongoClient } = require('mongodb');

const router = express.Router();

// Get Posts
router.get('/', async (req, res) => {
  const posts = await loadPostsCollection();
  res.send(await posts.find({}).toArray());
});

// Add Post
router.post('/', async (req, res) => {
   const posts = await loadPostsCollection();
   await posts.insertOne({
    text: req.body.text,
    createdAt: new Date()
   });
   res.status(201).send();
});

// Delete Post
router.delete('/:id', async (req, res) => {
    const posts = await loadPostsCollection();
    const postId = req.params.id;
    await posts.deleteOne({ _id: new ObjectID(postId) });
    res.status(200).send();
  });
  


async function loadPostsCollection() {
  const client = await MongoClient.connect('mongodb+srv://chirathb:19970720a@perfai-server.wfxtufp.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
  });
  return client.db('perfai').collection('posts');
}

module.exports = router;
