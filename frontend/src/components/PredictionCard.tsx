
import type { TargetPrediction } from "../types/api";

export function PredictionCard({
  title,
  prediction,
  active = false,
  onSelect,
}: {
  title: string;
  prediction?: TargetPrediction;
  active?: boolean;
  onSelect?: () => void;
}) {
  const probability = prediction ? Math.round(prediction.probability * 100) : 0;
  const label = prediction?.label ?? "unavailable";

  return (
    <button className={`prediction-card ${active ? "active" : ""}`} type="button" onClick={onSelect}>
      <span className="prediction-title">{title}</span>
      <strong className={label === "positive" ? "status-positive" : "status-negative"}>
        {label}
      </strong>
      <span className="meter" aria-label={`${title} model probability ${probability}%`}>
        <span style={{ width: `${probability}%` }} />
      </span>
      <span className="prediction-meta">
        {prediction ? `${probability}% model score` : "Waiting for model"}
      </span>
    </button>
  );
}
