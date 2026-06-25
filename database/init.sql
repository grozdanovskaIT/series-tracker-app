CREATE TABLE IF NOT EXISTS series (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  genre VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('planned', 'watching', 'completed')),
  rating NUMERIC(3, 1) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 10)),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO series (title, genre, status, rating, notes)
VALUES
  ('The Expanse', 'Science Fiction', 'completed', 9.2, 'Tense politics, big ideas, and excellent space drama.'),
  ('Severance', 'Thriller', 'watching', 8.8, 'Keep an eye on every detail.'),
  ('Shogun', 'Historical Drama', 'planned', NULL, 'Queued for a focused weekend watch.')
ON CONFLICT DO NOTHING;
