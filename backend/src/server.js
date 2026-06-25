import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { pool } from './db.js';

const app = express();
const port = process.env.PORT || 4000;
const allowedStatuses = new Set(['planned', 'watching', 'completed']);

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.get('/api/series', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, genre, status, rating, notes, created_at FROM series ORDER BY created_at DESC'
    );
    res.json(result.rows);
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
    const result = await pool.query(
      `INSERT INTO series (title, genre, status, rating, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, genre, status, rating, notes, created_at`,
      [title.trim(), genre.trim(), normalizedStatus, numericRating, notes?.trim() || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add series' });
  }
});

app.delete('/api/series/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM series WHERE id = $1 RETURNING id', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Series not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete series' });
  }
});

app.listen(port, () => {
  console.log(`Series Tracker API listening on port ${port}`);
});

