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
