
export type TargetId = "cad" | "lad" | "lcx" | "rca";

export interface ApiHealth {
  status: string;
  model_status: string;
}

export interface TargetPrediction {
  label: "positive" | "negative";
  predicted_class: string;
  probability: number;
  threshold: number | null;
  threshold_status: string;
  positive_class: string;
  class_probabilities?: Record<string, number>;
}

export interface TargetExplanation {
  status: "available" | "unavailable";
  method: string;
  message?: string;
}

export interface PredictionResponse {
  status: "ok";
  model_version: string;
  predictions: Record<TargetId, TargetPrediction>;
  explanations?: Partial<Record<TargetId, TargetExplanation>>;
  notice: string;
  warnings: string[];
}

export interface ModelInfo {
  model_version: string;
  status: string;
  sklearn_version?: string;
  dataset_shape?: [number, number];
  targets: TargetId[];
  features: string[];
  target_feature_counts: Record<TargetId, number>;
  notice: string;
}
