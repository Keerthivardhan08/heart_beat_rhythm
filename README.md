
# HEART_BEAT_RHYTHM 🫀

An explainable cardiovascular machine-learning research prototype combining tabular ML, an interactive coronary anatomy viewer, and a web application.

> **Research/education prototype only.** This project is not a clinically validated diagnostic system and must not be used to make patient-care decisions.

## Team ownership

| Owner | Folder | Responsibility |
|---|---|---|
| Person 1 (ML Lead) | `ml/` | Dataset audit, leakage prevention, model training/evaluation, explanations |
| Person 2 (3D Lead) | `visualization/` | 3D viewer, vessel selection, anatomical asset and mapping |
| Person 3 (Frontend Lead) | `frontend/` | UI pages, forms, charts, result screens |
| Person 4 (Backend/QA Lead) | `backend/` | API, validation, model integration, reports, tests |

## Repository layout

- `ml/` — Python ML pipeline
- `backend/` — FastAPI service
- `frontend/` — React + TypeScript application
- `visualization/` — reusable 3D viewer module
- `shared/` — feature, target and vessel contracts
- `docs/` — architecture, setup, data and safety documentation
- `tests/` — cross-component integration tests

## Before implementation

1. Read `docs/problem-statement.md` and `docs/architecture.md`.
2. Confirm actual dataset columns and label definitions from the dataset documentation.
3. Agree on changes to files in `shared/` before merging.
4. Build and test with synthetic/mock data first.
5. Never ship mock predictions as real predictions.
6. Do not commit credentials, private patient data, large datasets, or model binaries.

## Local setup (starter)

Requirements: Python 3.11+ and Node.js 20+.

### Backend
```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API docs: http://127.0.0.1:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### ML environment
```bash
cd ml
python -m venv .venv
# Activate the environment as shown above
pip install -r requirements.txt
```

The starter deliberately returns a `model_not_configured` response rather than inventing predictions. Connect a trained and evaluated model before enabling inference.

## Git workflow

Create feature branches, open pull requests, and keep `main` runnable. Shared contracts should be reviewed by the relevant owners before changes are merged.
