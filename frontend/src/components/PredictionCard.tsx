import type { TargetExplanation, TargetPrediction } from "../types/api";

export function PredictionCard({
  title,
  prediction,
  explanation,
  active = false,
  onSelect,
}: {
  title: string;
  prediction?: TargetPrediction;
  explanation?: TargetExplanation;
  active?: boolean;
  onSelect?: () => void;
}) {
  const probability = prediction ? Math.round(prediction.probability * 100) : 0;
  const isPositive = prediction?.label === "positive";
  const label = prediction
    ? isPositive
      ? "Elevated Stenosis Risk"
      : "Low / Normal Risk"
    : "Pending Analysis";

  const topRisk = explanation?.top_risk_factors?.[0]?.feature;

  return (
    <button
      className={`prediction-card ${active ? "active" : ""} ${isPositive ? "is-positive" : "is-negative"}`}
      type="button"
      onClick={onSelect}
    >
      <div className="card-top-row">
        <span className="prediction-title">{title}</span>
        {prediction && (
          <span className={`status-badge ${isPositive ? "status-positive" : "status-negative"}`}>
            {isPositive ? "High Risk" : "Normal"}
          </span>
        )}
      </div>

      <div className="card-score-row">
        <span className="score-number">{prediction ? `${probability}%` : "--"}</span>
        <span className="score-label">{label}</span>
      </div>

      <div className="meter-container">
        <div
          className={`meter-bar ${isPositive ? "bar-positive" : "bar-negative"}`}
          style={{ width: `${prediction ? Math.max(probability, 4) : 0}%` }}
        />
      </div>

      {topRisk && (
        <div className="card-driver-tag" title={`Primary driver: ${topRisk}`}>
          <span>Driver:</span> <strong>{topRisk}</strong>
        </div>
      )}

      <div className="card-footer-meta">
        {prediction
          ? `Class: ${prediction.predicted_class} | ${active ? "Viewing Territory" : "Click to Inspect"}`
          : "Awaiting clinical run"}
      </div>
    </button>
  );
}
