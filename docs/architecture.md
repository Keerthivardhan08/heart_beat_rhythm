
# Architecture

```text
React frontend (Person 3)
   | HTTP/JSON
   v
FastAPI backend (Person 4)
   | validated features
   v
ML inference adapter (Person 1) ----> saved model + preprocessing artifact
   |
   +----> explanation/evaluation metadata

3D viewer (Person 2) is a reusable frontend module integrated into React.
Shared contracts define target IDs, feature names, response schema, and vessel mapping.
```

## Ownership

- Person 1 owns `ml/` and leads `shared/feature-manifest.json`.
- Person 2 owns `visualization/` and leads `shared/vessel-mapping.md`.
- Person 3 owns `frontend/`.
- Person 4 owns `backend/`, integration tests, and the API contract.
- Everyone reviews changes to shared contracts.

## Integration strategy

1. Agree on contracts.
2. Build frontend and API against explicit mock fixtures.
3. Add real model artifacts and inference only after evaluation.
4. Add the real 3D asset only after checking its license and vessel mapping.
5. Run integration tests and verify no mock output is exposed as a real prediction.
