
import type { ModelInfo, PredictionResponse } from "../types/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export async function getHealth() {
  const response = await fetch(`${API_BASE}/api/health`);
  if (!response.ok) throw new Error(`API health check failed: ${response.status}`);
  return response.json();
}

export async function getModelInfo(): Promise<ModelInfo> {
  const response = await fetch(`${API_BASE}/api/model-info`);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail?.message ?? `Model info failed: ${response.status}`);
  return body;
}

export async function requestPrediction(features: Record<string, unknown>): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE}/api/predictions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features, include_explanations: true }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail?.message ?? body.detail ?? `Prediction request failed: ${response.status}`);
  }
  return body;
}
