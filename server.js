require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Missing MONGO_URI. Set it in .env');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Mongo connection
mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('Mongo connection error', err);
    console.error('Tip: ensure your current IP is whitelisted in Atlas or allow 0.0.0.0/0 for dev.');
    process.exit(1);
  });

// Schema & model
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true, default: () => new Date().toISOString().slice(0, 10) },
  content: { type: String, required: true }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

// Routes
app.get('/api/posts', async (req, res) => {
  const posts = await Post.find().sort({ date: -1, createdAt: -1 });
  res.json(posts);
});

app.post('/api/posts', async (req, res) => {
  try {
    const { title, date, content } = req.body;
    const post = await Post.create({ title, date, content });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

app.put('/api/posts/:id', async (req, res) => {
  try {
    const { title, date, content } = req.body;
    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { title, date, content },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  const deleted = await Post.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// Serve static build when available
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
