
# API contract (starter)

The contract is intentionally minimal and must be expanded before frontend/backend integration.

## Health
`GET /api/health`
```json
{"status": "ok", "model_status": "not_configured"}
```

## Prediction
`POST /api/predictions`
```json
{
  "features": {
    "REPLACE_WITH_VERIFIED_FEATURE_NAME": 0
  }
}
```

When no trained model is configured, the API must return HTTP 503 with a clear `model_not_configured` error. It must not return invented predictions.

Once the dataset is audited, Person 1 and Person 4 must jointly define:
- exact feature names and types;
- missing-value policy;
- target label semantics;
- whether scores are probabilities or uncalibrated scores;
- model version and evaluation metadata;
- validation/error response format.
