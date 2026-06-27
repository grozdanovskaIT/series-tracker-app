import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Clapperboard, Plus, RefreshCw, Star, Trash2, Tv } from 'lucide-react';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || '';
const emptyForm = {
  title: '',
  genre: '',
  status: 'planned',
  rating: '',
  notes: ''
};

const statusLabels = {
  planned: 'Planned',
  watching: 'Watching',
  completed: 'Completed'
};

function getRatingTone(rating) {
  if (rating === null || rating === undefined) return 'unrated';
  if (rating < 5) return 'low';
  if (rating < 8) return 'medium';
  return 'high';
}

function RatingStars({ rating }) {
  if (rating === null || rating === undefined) {
    return <span className="rating-value unrated">Unrated</span>;
  }

  const filledStars = Math.round(Number(rating) / 2);
  const tone = getRatingTone(Number(rating));

  return (
    <span className={`rating-display ${tone}`} aria-label={`Rating ${rating} out of 10`}>
      <span className="stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={16}
            className={index < filledStars ? 'star filled' : 'star empty'}
            fill="currentColor"
          />
        ))}
      </span>
      <span className="rating-value">{rating}/10</span>
    </span>
  );
}

function App() {
  const [series, setSeries] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const stats = useMemo(() => {
    return series.reduce(
      (summary, item) => {
        summary[item.status] += 1;
        return summary;
      },
      { planned: 0, watching: 0, completed: 0 }
    );
  }, [series]);

  async function loadSeries() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/series`);
      if (!response.ok) throw new Error('Unable to load series');
      setSeries(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSeries();
  }, []);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function addSeries(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/series`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const payload = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(payload?.error || 'Unable to add series');

      setSeries((current) => [payload, ...current]);
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteSeries(id) {
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/series/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Unable to delete series');
      setSeries((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow"><Clapperboard size={16} aria-hidden="true" /> Personal watchlist</p>
          <h1>Series Tracker</h1>
          <p className="intro">
            Keep every planned, active, and completed series in one tidy place.
          </p>
        </div>
        <div className="hero-stats" aria-label="Series status summary">
          <span><strong>{stats.planned}</strong> planned</span>
          <span><strong>{stats.watching}</strong> watching</span>
          <span><strong>{stats.completed}</strong> completed</span>
        </div>
      </section>

      <section className="workspace">
        <form className="series-form" onSubmit={addSeries}>
          <div className="section-heading">
            <p className="section-kicker">New entry</p>
            <h2>Add series</h2>
          </div>
          <label>
            Title
            <input name="title" value={form.title} onChange={updateForm} placeholder="The Bear" required />
          </label>
          <label>
            Genre
            <input name="genre" value={form.genre} onChange={updateForm} placeholder="Drama, comedy" required />
          </label>
          <div className="form-row">
            <label>
              Status
              <select name="status" value={form.status} onChange={updateForm}>
                <option value="planned">Planned</option>
                <option value="watching">Watching</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label>
              Rating
              <input
                name="rating"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={form.rating}
                onChange={updateForm}
                placeholder="8.5"
              />
            </label>
          </div>
          <label>
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={updateForm}
              rows="4"
              placeholder="Where you left off, who recommended it, or why it is on the list"
            />
          </label>
          <button className="primary-button" type="submit" disabled={saving}>
            <Plus size={18} aria-hidden="true" />
            {saving ? 'Adding...' : 'Add series'}
          </button>
        </form>

        <section className="series-panel">
          <div className="panel-heading">
            <div className="section-heading">
              <p className="section-kicker">Library</p>
              <h2>All series</h2>
            </div>
            <button className="icon-button" type="button" onClick={loadSeries} aria-label="Refresh series">
              <RefreshCw size={18} aria-hidden="true" />
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
          {loading && <p className="empty-state">Loading series...</p>}
          {!loading && series.length === 0 && (
            <div className="empty-state">
              <Tv size={34} aria-hidden="true" />
              <h3>Your watchlist is ready</h3>
              <p>Add the first series to start tracking what is planned, in progress, and finished.</p>
            </div>
          )}

          <div className="series-grid">
            {series.map((item) => (
              <article className="series-card" key={item.id}>
                <div className="card-heading">
                  <span className="card-icon">
                    <Tv size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.genre}</p>
                  </div>
                </div>
                <div className="meta-row">
                  <span className={`status-pill ${item.status}`}>{statusLabels[item.status] || item.status}</span>
                  <RatingStars rating={item.rating} />
                </div>
                {item.notes && <p className="notes">{item.notes}</p>}
                <button className="delete-button" type="button" onClick={() => deleteSeries(item.id)}>
                  <Trash2 size={17} aria-hidden="true" />
                  Delete
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
