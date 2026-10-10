# MoveLingo

Relocation planner plus language-learning engine.

**Read [CONTRACT.md](CONTRACT.md) before every task. Never edit it.** Contract changes need group agreement and are additive only (see contracts/README.md).

## Branch rules (CONTRACT.md section 3)

- Branches: `feat/a`, `feat/b`, `feat/c`. Everyone works on their own branch.
- Commit every 15 minutes.
- Merge to `main` only at the three checkpoints, in order: B, then C, then A.
- `git pull --rebase origin main` before every push.

## Layout

```
apps/web/            Person A - Next.js 14 App Router (port 3000)
services/api/        Person B + C - FastAPI backend (port 8000)
data/countries/      Person B - relocation data (official sources only, null when unknown)
data/exam_specs/     Person C - exam specs and cached samples
contracts/           agreed contract changes only
```

## Run

```bash
# API (port 8000)
cd services/api
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt     # Windows
.venv/Scripts/uvicorn main:app --reload --port 8000
# unix equivalents: .venv/bin/pip, .venv/bin/uvicorn
# copy .env.example to .env first; LLM_MODE=mock for offline work

# Web (port 3000)
cd apps/web
npm install
npm run dev
```

## Backend conventions (decided at B0, main.py is frozen after this)

- `main.py` auto-registers every module in `services/api/routers/` that defines `router`.
  Each router is mounted under the `/api` prefix. A router may declare its paths either
  relative (`/users`) or already prefixed (`/api/users`); the registrar detects which and
  logs it at startup, so both styles work. New router files need no edits elsewhere.
- Every response error uses the contract shape `{"error": {"code": "...", "message": "..."}}`
  with a real HTTP status (404, 422, 500 included).
- CORS allows `http://localhost:3000` and the headers `Content-Type`, `X-User-Id`, `Accept`.
- Shared helper `services/api/deps.py` provides `get_user_id` for the `X-User-Id` header.
