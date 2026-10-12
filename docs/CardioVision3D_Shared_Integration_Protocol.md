# CardioVision 3D — Shared Integration Protocol

## Freeze these contracts first
1. `shared/feature-manifest.json`: Person 1 owns feature meaning, exact names, types and exclusions.
2. `shared/api-contract.md`: Person 4 owns the API envelope; Person 1 reviews model fields; Person 3 reviews UI needs.
3. `shared/vessel-mapping.md`: Person 2 owns mesh-to-vessel mapping and asset caveats.
4. Stable target IDs are `cad`, `lad`, `lcx`, `rca`.
5. A tabular vessel label is not lesion geometry. Do not draw a patient-specific blockage without imaging evidence.

## Suggested branches
- `main`: stable release only
- `feature/ml-pipeline`
- `feature/3d-viewer`
- `feature/dashboard`
- `feature/api-integration`

## Integration order
1. Create a mock JSON fixture and make frontend/viewer work against it.
2. Run backend with a stub endpoint that follows the exact contract.
3. Integrate real trained model artifacts and compare output schema.
4. Connect actual API response to dashboard and viewer.
5. Run end-to-end tests with mock mode disabled.
6. Fresh setup and demo rehearsal; tag release candidate.

## Intersection rules
- Do not let multiple people independently define feature names or target IDs.
- Person 1 owns ML feature semantics; Person 2 owns 3D mesh mapping; Person 3 owns visual composition; Person 4 owns API envelope and release integration.
- Dependency files have one owner at a time.
- Every mock response is visibly labeled and must not appear in the final demo as real output.
- Each PR includes a screenshot/log and relevant test evidence.
- Any schema change must update the shared contract and all consumers in the same integration cycle.

## Definition of integrated
A sample input travels from the real dashboard to the backend, through the loaded model artifacts, returns four predictions with model version, renders explanation status, updates the 3D vessel status, and handles errors without showing stale or fabricated outputs.
