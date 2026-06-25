import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Plus, RefreshCw, Trash2, Tv } from 'lucide-react';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const emptyForm = {
  title: '',
  genre: '',
  status: 'planned',
  rating: '',
  notes: ''
};

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
          <p className="eyebrow">Personal watchlist</p>
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
          <h2>Add series</h2>
          <label>
            Title
            <input name="title" value={form.title} onChange={updateForm} required />
          </label>
          <label>
            Genre
            <input name="genre" value={form.genre} onChange={updateForm} required />
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
              />
            </label>
          </div>
          <label>
            Notes
            <textarea name="notes" value={form.notes} onChange={updateForm} rows="4" />
          </label>
          <button className="primary-button" type="submit" disabled={saving}>
            <Plus size={18} aria-hidden="true" />
            {saving ? 'Adding...' : 'Add series'}
          </button>
        </form>

        <section className="series-panel">
          <div className="panel-heading">
            <h2>All series</h2>
            <button className="icon-button" type="button" onClick={loadSeries} aria-label="Refresh series">
              <RefreshCw size={18} aria-hidden="true" />
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
          {loading && <p className="empty-state">Loading series...</p>}
          {!loading && series.length === 0 && (
            <p className="empty-state">No series yet. Add your first one.</p>
          )}

          <div className="series-grid">
            {series.map((item) => (
              <article className="series-card" key={item.id}>
                <div className="card-heading">
                  <Tv size={20} aria-hidden="true" />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.genre}</p>
                  </div>
                </div>
                <div className="meta-row">
                  <span className={`status-pill ${item.status}`}>{item.status}</span>
                  <span>{item.rating === null ? 'Unrated' : `${item.rating}/10`}</span>
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
