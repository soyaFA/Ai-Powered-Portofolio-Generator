# Repo2Folio

**Turn any GitHub profile into a polished, AI-optimized developer portfolio — in minutes.**

Repo2Folio analyzes a GitHub developer's repositories and activity, uses Google Gemini to rewrite the raw data into recruiter-ready content, and renders it as a portfolio site you can preview, edit, save, and export as a standalone HTML file. Built with junior software engineers in mind.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white&labelColor=20232a)
![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?logo=googlegemini&logoColor=white)

---

## ✨ Features

- **GitHub profile analysis** — pulls repos, language breakdown, detected tech stack, stars/forks totals, and a 30-day activity summary (pushes, PRs, active days) from the GitHub API. Optional `GITHUB_TOKEN` support for higher rate limits.
- **AI content optimization** — sends the analysis to Google Gemini, which writes the professional summary, career-track framing, and project highlights instead of leaving you with raw repo descriptions. Includes graceful fallbacks when the AI service is unavailable or rate-limited.
- **12 portfolio templates** — Editorial, Terminal, Bento, Architect, Spotlight, Blueprint, Minimal, Matrix, Newspaper, Slate, Cards, and Split Dark — filterable by Light / Dark / Split Rail, each with a live mobile preview.
- **Studio editor** — tweak any generated content before publishing, and keep separate Frontend / Backend / Full-Stack drafts for the same GitHub account.
- **Saved portfolios** — every portfolio is persisted per user; list, load, edit, and delete your past work.
- **Standalone HTML export** — export any portfolio as a single self-contained HTML file you can host anywhere (GitHub Pages, Netlify, S3, …).
- **Full authentication** — email/password sign-up and sign-in with scrypt-hashed passwords and HMAC-SHA256-signed tokens, plus password reset via 6-digit OTP email (nodemailer SMTP).
- **Zero-config data layer** — connects to MongoDB through Mongoose when `MONGODB_URI` is set, and automatically falls back to a persistent local JSON store (`data/*.json`) when it isn't — so the app runs even without a database.
- **REST API** — clean, documented JSON API for auth, GitHub analysis, AI optimization, and portfolio CRUD.
- **Tested** — 9 test suites covering the AI service, API routes, auth, database layer, GitHub service, password reset, and frontend helpers, run with the built-in `node:test` runner.

## 🔄 How it works

1. **Sign up / log in** — create an account with your name, email, password, and GitHub username.
2. **Analyze** — enter a GitHub username and Repo2Folio fetches the profile, top repositories, language stats, and recent activity.
3. **Optimize with AI** — pick a career track (e.g., Frontend, Backend, Full-Stack) and let Gemini rewrite the content into a professional narrative.
4. **Pick a template** — browse 12 templates with live previews and light/dark variants.
5. **Edit & save** — fine-tune the copy in the Studio, then save the portfolio to your account.
6. **Export** — download the portfolio as a standalone HTML file and host it anywhere.

## 🛠 Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite 8, Tailwind CSS 4, TypeScript, Motion, Lucide icons |
| Backend | Node.js, Express 4, TypeScript (run with tsx) |
| Database | MongoDB via Mongoose 9, with local JSON-file fallback |
| AI | Google Gemini (`@google/genai`) with model fallback list |
| Auth | scrypt password hashing, HMAC-SHA256 signed tokens, OTP email reset |
| Email | Nodemailer (SMTP) |
| Testing | `node:test` runner via tsx |

## 📁 Project structure

```
repo2folio/
├── server.ts                  # Express entry point (dev: Vite middleware / prod: static dist)
├── server/
│   ├── db.ts                  # MongoDB (Mongoose) + local JSON fallback repositories
│   ├── models/                # User & Portfolio Mongoose models
│   ├── routes/api.ts          # REST API endpoints
│   └── services/              # auth, GitHub analysis, AI, email, password reset
├── src/
│   ├── components/            # Studio, Templates gallery, Saved list, Auth views
│   │   └── templates/         # The 12 portfolio templates
│   ├── hooks/                 # Auth, portfolio builder, saved portfolios
│   ├── services/api.ts        # Frontend API client
│   ├── types/                 # Shared TypeScript types
│   └── utils/                 # HTML export, content & portfolio helpers
├── tests/                     # 9 node:test suites
├── data/                      # Local JSON store (fallback mode)
├── docker-compose.yml         # MongoDB + backend (+ optional frontend dev container)
└── vite.config.ts
```

## 🚀 Getting started

### Prerequisites

- **Node.js 20+** (the Docker frontend container uses Node 22)
- **Bun or npm** for installing dependencies (both lockfiles are included)
- A **Gemini API key** for the AI features — get one free from [Google AI Studio](https://aistudio.google.com/)
- *(Optional)* **MongoDB** — local instance or an Atlas cluster. Without it, the app falls back to the local JSON store.
- *(Optional)* **GitHub token** — raises your GitHub API rate limit.
- *(Optional)* **SMTP credentials** — enables real password-reset emails.

### 1. Clone and install

```bash
git clone https://github.com/<your-username>/repo2folio.git
cd repo2folio
npm install        # or: bun install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Server port (default `3000`) |
| `NODE_ENV` | No | `development` (Vite middleware) or `production` (serves `dist/`) |
| `APP_URL` | No | Public app URL, used in password-reset emails |
| `MONGODB_URI` | No | MongoDB connection string. If unset/unreachable, falls back to the local JSON store in `data/` |
| `AUTH_SECRET` | **Yes** | Secret used to sign auth tokens — use a long random string |
| `GEMINI_API_KEY` | For AI | Google Gemini API key (AI optimization is disabled without it) |
| `GITHUB_TOKEN` | No | GitHub personal access token for higher API rate limits |
| `SMTP_HOST` | For emails | SMTP server host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | No | SMTP port (default `587`) |
| `SMTP_USER` / `SMTP_PASS` | For emails | SMTP credentials (for Gmail, use an App Password) |
| `SMTP_FROM` | No | From-header for reset emails |
| `SMTP_DEV_PREVIEW` | No | `true` (default) logs the OTP code to the server console instead of sending an email — handy for local development |

### 3. Run in development

```bash
npm run dev
```

The Express server and the Vite dev server run together on **http://localhost:3000** (no separate frontend process needed in local dev).

### 4. Run tests & type checks

```bash
npm test          # runs the 9 test suites with node:test via tsx
npm run lint      # type-checks the whole project (tsc --noEmit)
```

### 5. Production build

```bash
npm run build     # vite build → dist/
npm start         # NODE_ENV=production tsx server.ts
```

In production the Express server serves the built SPA from `dist/` and the API from `/api` on the same port.

## 🐳 Docker

`docker-compose.yml` ships three services: MongoDB 7.0 (with healthcheck), the backend API on port **3000**, and an optional decoupled frontend dev container on port **5173**.

```bash
# Start MongoDB + backend (backend serves the built frontend too)
docker compose up --build -d

# Or with the decoupled Vite frontend on :5173
docker compose up --build -d frontend
```

Secrets are injected from your shell or `.env` — never hard-code them:

```bash
AUTH_SECRET=$(openssl rand -hex 32) GEMINI_API_KEY=your-key docker compose up -d
```

## 📡 API reference

All endpoints return JSON. Authenticated routes expect a bearer token issued by `/api/auth/login` or `/api/auth/register`.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | — | Health check: DB mode + whether AI is configured |
| `POST` | `/api/auth/register` | — | Create an account, returns `{ token, user }` |
| `POST` | `/api/auth/login` | — | Sign in, returns `{ token, user }` |
| `GET` | `/api/auth/me` | ✅ | Current user profile |
| `POST` | `/api/auth/forgot-password` | — | Send a 6-digit OTP to the account email |
| `POST` | `/api/auth/reset-password` | — | Reset the password using the OTP code |
| `GET` | `/api/auth/reset-email-configured` | — | Whether SMTP email is configured |
| `GET` | `/api/github/analyze/:username` | ✅ | Full GitHub analysis: profile, repos, languages, activity |
| `POST` | `/api/ai/optimize` | ✅ | Optimize portfolio content with Gemini |
| `GET` | `/api/portfolios` | ✅ | List the current user's saved portfolios |
| `POST` | `/api/portfolios` | ✅ | Save a new portfolio |
| `GET` | `/api/portfolios/:id` | ✅ | Load a saved portfolio |
| `PUT` | `/api/portfolios/:id` | ✅ | Update a saved portfolio |
| `DELETE` | `/api/portfolios/:id` | ✅ | Delete a saved portfolio |

## 🔒 Security notes

- Passwords are hashed with **scrypt**; auth tokens are signed with **HMAC-SHA256** using `AUTH_SECRET`.
- Reset OTPs are stored hashed, expire after a few minutes, and are invalidated after too many incorrect attempts.
- Every portfolio query is scoped to the owning user — IDs from other accounts return `403/404`.
- Never commit your `.env`. The repo's `.gitignore` already excludes `.env*` (only `.env.example` is tracked). **If any real keys or passwords were ever committed or shared, rotate them immediately** (Gemini key, MongoDB password, SMTP/app password).

## 🤝 Contributing

1. Fork the repo and create your branch: `git checkout -b feature/my-feature`
2. Make your changes and add tests in `tests/` where it makes sense.
3. Run `npm test` and `npm run lint` before opening a pull request.

## 📄 License

No license has been chosen yet — add a `LICENSE` file (e.g. MIT) before publishing the repository.
