# ModuloTrainer

A module-based learning platform. Students browse courses, work through each course's modules in order, and track their own completion.

Stack: **React JS + Tailwind CSS** (frontend) · **Node JS + Express** (backend) · **MySQL** (database, via Sequelize).

## Project structure

```
modulotrainer/
├── backend/          Node/Express API + MySQL models (Sequelize)
│   ├── config/         database.js — MySQL connection
│   ├── models/         Course.js, Module.js, Progress.js, index.js (associations)
│   ├── routes/         courses.js, progress.js
│   ├── schema.sql        reference SQL schema (tables are also auto-created on boot)
│   ├── server.js         Express app entrypoint
│   ├── seed.js            Loads 4 sample courses + modules into MySQL
│   └── .env.example
└── frontend/         React app (Create React App + Tailwind)
    ├── src/
    │   ├── components/  CourseCatalog, CourseCard, CourseDetail, Module
    │   ├── api.js         Fetch helpers for the backend API
    │   └── App.jsx
    └── .env.example
```

## 1. Prerequisites

- Node.js 18+ and npm
- A MySQL server (8.0+) — installed locally, via Docker, or a managed service like PlanetScale / Amazon RDS / Railway

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MySQL host/user/password — see below

npm run seed     # creates the tables (if needed) and loads 4 sample courses + their modules
npm run dev       # starts the API on http://localhost:5000
```

`.env` fields:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=modulotrainer
DB_USER=root
DB_PASSWORD=your_mysql_password
```

The database itself needs to exist before you seed — either run `CREATE DATABASE modulotrainer;` in a MySQL client yourself, or use the statement at the top of `backend/schema.sql`. Tables (`courses`, `modules`, `progress`) are created automatically the first time the app connects (via Sequelize's `sync()`) — `schema.sql` is there purely as a reference for the shape of the data, not something you need to run by hand.

Health check: open `http://localhost:5000/api/health` — you should see `{"ok": true}`.

## 3. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
# .env already points at http://localhost:5000/api — change it if your backend runs elsewhere

npm start          # opens http://localhost:3000
```

## How it works

- **Courses** live in a `courses` table, **modules** live in a `modules` table with a foreign key back to their course (`Course.hasMany(Module)`) — each module carries a `pdfFile`, the filename of its reading material inside `backend/materials/`.
- **Progress** lives in a `progress` table: one row per student per completed module (`student_id`, `course_slug`, `module_order`). Marking a module complete inserts a row; un-marking it deletes that row. The `/api/progress/:studentId` route groups these rows back into `{ courseSlug, completedModules: [...] }` for the frontend, so the API shape the React app talks to didn't need to change at all when the database did. The frontend generates a random `studentId` on first visit and keeps it in `localStorage`, so progress persists across sessions without needing a login system.
- The catalog view shows every course with a small trail of dots indicating modules completed. Opening a course shows the full module path — click a module to expand its details, then "Mark as complete" to check it off; the progress bar and dots update immediately.

### Readable PDF modules

Every module comes with a one-page reading PDF (overview, key takeaways, and a quick-check question) generated from `backend/materials-data.json`.

- `backend/materials/*.pdf` — the 21 pre-generated PDFs (one per module), already included in this download.
- `backend/generate_materials.py` — regenerates them any time you edit `materials-data.json` (needs `pip install reportlab`, then `python3 generate_materials.py`).
- **API**: `GET /api/courses/:slug/modules/:index/pdf` streams the module's PDF with `Content-Disposition: inline`, so it can be rendered directly in a browser or an `<iframe>` rather than forcing a download.
- **Frontend**: each module has "Read module PDF" (opens an embedded viewer right in the page), "Open in new tab", and "Download" — see `frontend/src/components/Module.jsx`.

If you add a course or module, add its entry to `materials-data.json`, re-run `generate_materials.py`, then re-run `npm run seed` so MongoDB picks up the new `pdfFile` reference.

## Extending it

- **Add real authentication**: replace the generated `studentId` in `frontend/src/api.js` with a logged-in user's ID once you add an auth system (e.g. JWT, Auth0, or Firebase Auth).
- **Add more courses**: edit `backend/seed.js` and re-run `npm run seed`, or build an admin route to create courses via the API.
- **Deploy**: the backend can be deployed to any Node host (Render, Railway, Fly.io) pointed at a managed MySQL instance (PlanetScale, Amazon RDS, Railway's own MySQL add-on); the frontend can be built with `npm run build` in `frontend/` and deployed as a static site (Vercel, Netlify) with `REACT_APP_API_URL` pointed at your deployed backend.

## Included standalone demo

`modulotrainer-demo.html` (in this same download) is a single-file, no-install version of the same idea — open it directly in a browser to click through the UI without setting up Node or MongoDB. It uses the browser's local storage instead of a real database, and has all 21 module PDFs embedded directly in the file, so "Read module PDF" works offline too.
