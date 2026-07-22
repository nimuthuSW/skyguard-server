# skyguard-server

SkyGuard backend — Express + TypeScript API server.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Visit http://localhost:3000/health — should return:

```json
{ "status": "ok", "message": "SkyGuard server running" }
```

## Scripts

- `npm run dev` — start dev server with hot reload (ts-node-dev)
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run compiled server

## Notes for the team

- Tharana adds Prisma + PostgreSQL on top of this repo (clone this, then `npm install prisma @prisma/client && npx prisma init`).
- Base branch: `develop`. Never commit to `main`/`develop` directly — open a PR.

## Auth Endpoints (Sprint 2)

Requires Tharana's Prisma setup (`prisma/schema.prisma` + `npx prisma migrate dev`) and a `DATABASE_URL` + `JWT_SECRET` in `.env`.

### POST /auth/register
Body: `{ "name": "...", "email": "...", "password": "..." }`
- `201` → `{ token, user: { id, name, email } }`
- `400` → missing fields, or email already registered

### POST /auth/login
Body: `{ "email": "...", "password": "..." }`
- `200` → `{ token, user: { id, name, email } }`
- `400` → missing fields, or invalid credentials

Notes:
- Emails are stored and matched lowercased.
- Passwords are hashed with bcrypt (10 rounds); the hash is never returned.
- JWTs are signed with `JWT_SECRET` and expire in 7 days.
