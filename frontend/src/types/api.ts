
export type TargetId = "cad" | "lad" | "lcx" | "rca";

export interface ApiHealth {
  status: string;
  model_status: string;
}

export interface PredictionResponse {
  status: "ok" | "model_not_configured" | "error";
  model_version: string | null;
  targets: Partial<Record<TargetId, unknown>>;
  warnings: string[];
}
