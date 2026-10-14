import type { TargetExplanation } from "../types/api";

interface FeatureExplanationProps {
  targetName: string;
  explanation?: TargetExplanation;
  probability?: number;
}

export function FeatureExplanation({
  targetName,
  explanation,
  probability,
}: FeatureExplanationProps) {
  if (!explanation || explanation.status !== "available") {
    return (
      <section className="panel explanation-panel">
        <p className="eyebrow">AI MODEL EXPLAINABILITY</p>
        <h3>Feature Contributions for {targetName}</h3>
        <p className="text-muted">
          Run an analysis or select a clinical case to inspect the mathematical log-odds
          contributions driving this vessel's risk prediction.
        </p>
      </section>
    );
  }

  const riskFactors = explanation.top_risk_factors || [];
  const protectiveFactors = explanation.top_protective_factors || [];

  return (
    <section className="panel explanation-panel">
      <div className="explanation-header">
        <div>
          <p className="eyebrow">AI MODEL EXPLAINABILITY (SHAP / LOG-ODDS)</p>
          <h3>Diagnostic Feature Drivers for {targetName}</h3>
        </div>
        <span className="method-pill">Method: Logistic Weight Contribution</span>
      </div>

      <p className="explanation-summary">
        {probability !== undefined && (
          <strong>
            {probability >= 0.5
              ? `Elevated risk (${Math.round(probability * 100)}%) is primarily propelled by:`
              : `Low risk (${Math.round(probability * 100)}%) is maintained by favorable biomarkers:`}
          </strong>
        )}
      </p>

      <div className="explanation-columns">
        {/* Risk Escalation Factors */}
        <div className="factors-column risk-column">
          <div className="column-title">
            <span className="factor-dot dot-risk" />
            <strong>Risk Escalating Drivers (+ Log-Odds)</strong>
          </div>
          {riskFactors.length === 0 ? (
            <p className="text-muted small">No significant risk elevating features detected.</p>
          ) : (
            <div className="factor-bars-list">
              {riskFactors.map((factor, index) => {
                const maxImpact = Math.max(...riskFactors.map((f) => Math.abs(f.impact)), 1);
                const pct = Math.min((Math.abs(factor.impact) / maxImpact) * 100, 100);
                return (
                  <div className="factor-bar-item" key={index}>
                    <div className="factor-label-row">
                      <span className="factor-name">{factor.feature}</span>
                      <strong className="factor-impact risk">+{factor.impact}</strong>
                    </div>
                    <div className="factor-track">
                      <div className="factor-fill risk" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Protective Factors */}
        <div className="factors-column protective-column">
          <div className="column-title">
            <span className="factor-dot dot-protective" />
            <strong>Protective / Risk Mitigating Factors</strong>
          </div>
          {protectiveFactors.length === 0 ? (
            <p className="text-muted small">No prominent protective dampeners identified.</p>
          ) : (
            <div className="factor-bars-list">
              {protectiveFactors.map((factor, index) => {
                const maxImpact = Math.max(...protectiveFactors.map((f) => Math.abs(f.impact)), 1);
                const pct = Math.min((Math.abs(factor.impact) / maxImpact) * 100, 100);
                return (
                  <div className="factor-bar-item" key={index}>
                    <div className="factor-label-row">
                      <span className="factor-name">{factor.feature}</span>
                      <strong className="factor-impact protective">-{factor.impact}</strong>
                    </div>
                    <div className="factor-track">
                      <div className="factor-fill protective" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
