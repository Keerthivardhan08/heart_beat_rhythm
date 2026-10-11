
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export async function getHealth() {
  const response = await fetch(`${API_BASE}/api/health`);
  if (!response.ok) throw new Error(`API health check failed: ${response.status}`);
  return response.json();
}

export async function requestPrediction(features: Record<string, unknown>) {
  const response = await fetch(`${API_BASE}/api/predictions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.detail?.message ?? body.detail ?? `Prediction request failed: ${response.status}`);
  }
  return body;
}
