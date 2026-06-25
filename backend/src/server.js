import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { connectDatabase, isDatabaseConnected } from './db.js';
import { Series } from './models/Series.js';

const app = express();
const port = process.env.PORT || 4000;
const allowedStatuses = new Set(['planned', 'watching', 'completed']);

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  const connected = isDatabaseConnected();
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'error',
    mongodb: connected ? 'connected' : 'disconnected'
  });
});

app.get('/api/series', async (_req, res) => {
  try {
    const series = await Series.find().sort({ createdAt: -1 });
    res.json(series);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch series' });
  }
});

app.post('/api/series', async (req, res) => {
  const { title, genre, status, rating, notes } = req.body;
  const normalizedStatus = String(status || '').toLowerCase();
  const numericRating = rating === '' || rating === null || rating === undefined ? null : Number(rating);

  if (!title || !genre || !allowedStatuses.has(normalizedStatus)) {
    return res.status(400).json({
      error: 'Title, genre, and a valid status are required'
    });
  }

  if (numericRating !== null && (Number.isNaN(numericRating) || numericRating < 0 || numericRating > 10)) {
    return res.status(400).json({ error: 'Rating must be a number from 0 to 10' });
  }

  try {
    const series = await Series.create({
      title,
      genre,
      status: normalizedStatus,
      rating: numericRating,
      notes: notes || null
    });

    res.status(201).json(series);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add series' });
  }
});

app.delete('/api/series/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const series = await Series.findByIdAndDelete(id);

    if (!series) {
      return res.status(404).json({ error: 'Series not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete series' });
  }
});

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Series Tracker API listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });
