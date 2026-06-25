# Series Tracker App

Series Tracker App is a small full-stack application for keeping track of TV series you plan to watch, are currently watching, or have completed.

## Services

- `frontend`: React + Vite web app served on port `5173`.
- `backend`: Node.js + Express REST API served on port `4000`.
- `postgres`: PostgreSQL database served on port `5432`.

## Run With Docker Compose

From the project root, run:

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:4000/api/health`

To stop the app:

```bash
docker compose down
```

To remove the database volume and start fresh:

```bash
docker compose down -v
```

## API Endpoints

### `GET /api/health`

Checks whether the backend is running and can reach PostgreSQL.

### `GET /api/series`

Returns all series ordered by creation date.

### `POST /api/series`

Creates a new series.

Request body:

```json
{
  "title": "Dark",
  "genre": "Science Fiction",
  "status": "planned",
  "rating": 9,
  "notes": "Watch with full attention."
}
```

Valid `status` values are `planned`, `watching`, and `completed`. Rating is optional and must be between `0` and `10`.

### `DELETE /api/series/:id`

Deletes a series by ID.

## Database

The database initialization script lives at `database/init.sql`. It creates the `series` table with:

- `id`
- `title`
- `genre`
- `status`
- `rating`
- `notes`
- `created_at`

## Project Structure

```text
series-tracker-app/
  backend/
    src/
    Dockerfile
    package.json
  frontend/
    src/
    Dockerfile
    package.json
  database/
    init.sql
  k8s/
    README.md
  .github/
    workflows/
      README.md
  docker-compose.yml
  README.md
```
