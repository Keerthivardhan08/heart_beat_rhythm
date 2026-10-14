import { useState } from "react";
import { ThreeHeartViewer } from "../components/ThreeHeartViewer";
import { CLINICAL_CASES, type ClinicalCase } from "../data/clinicalCases";
import type { TargetId, TargetPrediction } from "../types/api";

const vesselLabels: Record<TargetId, string> = {
  cad: "Overall CAD",
  lad: "Left Anterior Descending (LAD)",
  lcx: "Left Circumflex (LCX)",
  rca: "Right Coronary Artery (RCA)",
};

const vesselDetails: Record<
  TargetId,
  { perfusion: string; significance: string; normalLength: string }
> = {
  cad: {
    perfusion: "Global coronary arterial circulation",
    significance: "Summary burden of obstructive coronary stenosis",
    normalLength: "N/A (Multi-vessel network)",
  },
  lad: {
    perfusion: "Anterior wall, interventricular septum & apex of Left Ventricle",
    significance: "The 'widowmaker' vessel — supplies 45-55% of LV myocardial mass",
    normalLength: "10 – 13 cm",
  },
  lcx: {
    perfusion: "Lateral, posterolateral wall of Left Ventricle & SA node in 40%",
    significance: "Branches into obtuse marginal (OM) arteries",
    normalLength: "6 – 8 cm",
  },
  rca: {
    perfusion: "Right ventricle, inferior wall, SA node in 60%, AV node in 90%",
    significance: "Supplies right chambers and diaphragmatic wall of left ventricle",
    normalLength: "12 – 14 cm",
  },
};

export function AnatomyViewer({
  predictions,
  selected,
  onSelect,
  onApplyCaseFeatures,
}: {
  predictions?: Partial<Record<TargetId, TargetPrediction>>;
  selected: TargetId;
  onSelect: (target: TargetId) => void;
  onApplyCaseFeatures?: (features: Record<string, number>) => void;
}) {
  const hasLivePredictions = !!predictions && Object.keys(predictions).length > 0;
  const [mode, setMode] = useState<"live" | "preset">(hasLivePredictions ? "live" : "preset");
  const [selectedCaseId, setSelectedCaseId] = useState<string>("lad-isolated");
  const [activeTab, setActiveTab] = useState<"cases" | "details">("cases");

  const currentCase = CLINICAL_CASES.find((c) => c.id === selectedCaseId) || CLINICAL_CASES[0];

  // Determine active predictions
  const activePredictions = mode === "live" && predictions ? predictions : currentCase.predictions;

  // Determine which vessel has the 3D problem (stenosis ring, slow flow, aura)
  let activeStenosisTarget: TargetId | null = null;
  let severityScore = 80;

  if (mode === "preset") {
    activeStenosisTarget = currentCase.vessel !== "cad" ? currentCase.vessel : selected;
    severityScore = currentCase.stenosisSeverity;
  } else if (predictions) {
    // In live manual input mode:
    // 1. If user selected a specific vessel and that vessel is positive -> show it
    if (selected !== "cad" && predictions[selected]?.label === "positive") {
      activeStenosisTarget = selected;
      severityScore = Math.round((predictions[selected]?.probability || 0.8) * 100);
    }
    // 2. Or check which vessel has elevated risk
    else if (predictions.lad?.label === "positive") {
      activeStenosisTarget = "lad";
      severityScore = Math.round((predictions.lad?.probability || 0.8) * 100);
    } else if (predictions.lcx?.label === "positive") {
      activeStenosisTarget = "lcx";
      severityScore = Math.round((predictions.lcx?.probability || 0.8) * 100);
    } else if (predictions.rca?.label === "positive") {
      activeStenosisTarget = "rca";
      severityScore = Math.round((predictions.rca?.probability || 0.8) * 100);
    } else {
      // All vessels normal (healthy heart)
      activeStenosisTarget = null;
      severityScore = 0;
    }
  }

  const activeDetail = vesselDetails[selected] ?? vesselDetails.lad;

  const handleSelectCase = (c: ClinicalCase) => {
    setMode("preset");
    setSelectedCaseId(c.id);
    if (c.vessel !== "cad") {
      onSelect(c.vessel);
    }
    if (onApplyCaseFeatures) {
      onApplyCaseFeatures(c.sampleFeatures);
    }
  };

  return (
    <section className="anatomy-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">3D CLINICAL ANATOMY & PATHOLOGY WORKSPACE</p>
          <h2>Interactive Coronary Anatomy & Artery Pathology Simulation</h2>
        </div>
        <div className="license-pill">Dynamic 3D Hemodynamic & Stenosis Engine Active</div>
      </div>

      {/* Case Navigator Bar: Quick Selector for All Single Artery Cases & Triple Vessel */}
      <div className="cases-selector-bar panel">
        <div className="selector-header">
          <div>
            <span className="case-tag">DATA SOURCE & SCENARIO SELECTOR</span>
            <h4>Choose between Live Manual Patient Inputs or Preset Clinical Scenarios:</h4>
          </div>
          <div className="active-case-badge">
            <span className="live-dot" />{" "}
            {mode === "live"
              ? activeStenosisTarget
                ? `Live Patient: ${activeStenosisTarget.toUpperCase()} Stenosis (${severityScore}%)`
                : "Live Patient: Normal Patent (0% Stenosis)"
              : currentCase.badge}
          </div>
        </div>

        <div className="cases-pill-list">
          {/* Live Patient Pill */}
          <button
            type="button"
            className={`case-pill-button ${mode === "live" ? "active is-live-pill" : ""}`}
            onClick={() => setMode("live")}
            title="Inspect 3D heart with your manual analysis inputs"
          >
            <div className="pill-top">
              <span className="pill-vessel">🟢 Live Manual Analysis</span>
              <span className="pill-badge badge-cad">ACTIVE PATIENT</span>
            </div>
            <div className="pill-sub">
              {hasLivePredictions
                ? activeStenosisTarget
                  ? `⚠ ${activeStenosisTarget.toUpperCase()} Problem Detected`
                  : "✓ Normal / All Vessels Patent"
                : "Awaiting New Analysis"}
            </div>
          </button>

          {/* Preset Clinical Cases */}
          {CLINICAL_CASES.map((c) => {
            const isCaseActive = mode === "preset" && c.id === selectedCaseId;
            return (
              <button
                key={c.id}
                type="button"
                className={`case-pill-button ${isCaseActive ? "active" : ""}`}
                onClick={() => handleSelectCase(c)}
              >
                <div className="pill-top">
                  <span className="pill-vessel">{c.shortLabel}</span>
                  <span className={`pill-badge badge-${c.vessel}`}>{c.vessel.toUpperCase()}</span>
                </div>
                <div className="pill-sub">
                  {c.stenosisSeverity > 0 ? `⚠ ${c.stenosisSeverity}% Stenosis` : "✓ 0% Patent"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="viewer-layout">
        {/* Main 3D Stage with Animated Problem & Particle Simulation */}
        <div className="viewer-stage panel">
          <ThreeHeartViewer
            predictions={activePredictions}
            selected={selected}
            onSelect={onSelect}
            stenosisVessel={activeStenosisTarget}
            stenosisSeverity={severityScore}
          />
        </div>

        {/* Selected Vessel & Clinical Case Diagnostic Summary */}
        <aside className="panel vessel-panel">
          <div className="tabs-header">
            <button
              type="button"
              className={activeTab === "cases" ? "active" : ""}
              onClick={() => setActiveTab("cases")}
            >
              {mode === "live" ? "Live Patient Findings" : "Scenario Analysis"}
            </button>
            <button
              type="button"
              className={activeTab === "details" ? "active" : ""}
              onClick={() => setActiveTab("details")}
            >
              Anatomy Specs
            </button>
          </div>

          {activeTab === "cases" ? (
            <div className="case-analysis-content">
              <div className="case-title-box">
                <p className="eyebrow">
                  {mode === "live" ? "ACTIVE PATIENT EVALUATION" : "PATHOLOGY PROFILE"}
                </p>
                <h3>
                  {mode === "live"
                    ? activeStenosisTarget
                      ? `Active Patient: Significant ${activeStenosisTarget.toUpperCase()} Stenosis`
                      : "Active Patient: Normal Coronary Circulation"
                    : currentCase.name}
                </h3>
                <p className="case-desc">
                  {mode === "live"
                    ? activeStenosisTarget
                      ? `Based on manual clinical features, the model classifies ${activeStenosisTarget.toUpperCase()} with elevated risk (${severityScore}%). Flashing yellow plaque ring and slowed hypoxic blood flow illustrate the lesion in 3D.`
                      : "Patient features reflect low risk across all epicardial distributions. Blood flow in the 3D heart moves rapidly in uniform oxygenated red without obstruction."
                    : currentCase.description}
                </p>
              </div>

              {/* Stenosis Severity Meter */}
              <div className="severity-meter-box">
                <div className="meter-label">
                  <span>Luminal Stenosis Severity</span>
                  <strong className={severityScore >= 50 ? "text-danger" : "text-success"}>
                    {severityScore}% {severityScore >= 50 ? "Luminal Stenosis" : "Normal Caliber"}
                  </strong>
                </div>
                <div className="meter-track">
                  <div
                    className={`meter-fill ${severityScore >= 50 ? "fill-danger" : "fill-success"}`}
                    style={{ width: `${Math.max(severityScore, 4)}%` }}
                  />
                </div>
              </div>

              {/* Case Diagnostic Highlights */}
              <div className="case-highlights-grid">
                <div className="highlight-item">
                  <span className="hl-label">Perfusion Zone</span>
                  <span className="hl-val">
                    {mode === "live"
                      ? activeStenosisTarget
                        ? vesselDetails[activeStenosisTarget].perfusion
                        : "Physiological uniform perfusion across LV & RV"
                      : currentCase.perfusionTerritory}
                  </span>
                </div>
                <div className="highlight-item">
                  <span className="hl-label">ECG / Echo Correlate</span>
                  <span className="hl-val">
                    {mode === "live"
                      ? "Derived from patient input parameters (RWMA, ST deviation, EF-TTE)"
                      : currentCase.ecgFinding}
                  </span>
                </div>
                <div className="highlight-item">
                  <span className="hl-label">Clinical Implication</span>
                  <span className="hl-val">
                    {mode === "live"
                      ? severityScore >= 50
                        ? "Urgent consideration for diagnostic coronary angiography or CCTA."
                        : "Conservative management; monitor risk factors."
                      : currentCase.hemodynamicEffect}
                  </span>
                </div>
              </div>

              {/* 4-Target Risk Breakdown for Current Case */}
              <p className="eyebrow" style={{ marginTop: "1rem" }}>
                MODEL 4-TARGET RISK ASSESSMENT
              </p>
              <div className="vessel-list">
                {(["lad", "lcx", "rca", "cad"] as TargetId[]).map((target) => {
                  const p = activePredictions?.[target];
                  const isPos = p?.label === "positive";
                  return (
                    <button
                      className={selected === target ? "active" : ""}
                      key={target}
                      type="button"
                      onClick={() => onSelect(target)}
                    >
                      <span>{vesselLabels[target]}</span>
                      <strong>
                        {p
                          ? `${Math.round(p.probability * 100)}% (${
                              isPos ? "Elevated" : "Normal"
                            })`
                          : "Pending"}
                      </strong>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="anatomy-specs-content">
              <p className="eyebrow">VESSEL STATUS & METRICS</p>
              <h3>{vesselLabels[selected]}</h3>

              <VesselReadout
                name={vesselLabels[selected]}
                prediction={activePredictions?.[selected]}
              />

              {/* Anatomical Perfusion Reference */}
              <div className="anatomy-card-facts">
                <p className="fact-title">Myocardial Perfusion Territory</p>
                <p className="fact-desc">{activeDetail.perfusion}</p>

                <p className="fact-title">Clinical Significance</p>
                <p className="fact-desc">{activeDetail.significance}</p>

                <p className="fact-title">Average Anatomical Caliber</p>
                <p className="fact-desc">{activeDetail.normalLength}</p>
              </div>
            </div>
          )}
        </aside>

        {/* 3D Animation & Pathology Legend */}
        <aside className="panel asset-panel">
          <p className="eyebrow">3D PATHOLOGY ANIMATION ENGINE</p>
          <h3>How to Read the 3D Problem Simulation</h3>
          <p>The viewer visualizes coronary artery problems in real-time WebGL:</p>
          <ul className="pathology-legend-list">
            <li>
              <div className="legend-indicator ring-indicator" />
              <div>
                <strong>Flashing Plaque Ring:</strong> Marks the exact anatomical location
                of the luminal stenosis (e.g., proximal LAD, LCX obtuse marginal, or mid-RCA).
              </div>
            </li>
            <li>
              <div className="legend-indicator flow-indicator" />
              <div>
                <strong>Hemodynamic Blood Flow:</strong> High-speed red particles indicate normal
                oxygenated flow. Slowed cyan particles indicate post-stenotic distal hypoperfusion.
              </div>
            </li>
            <li>
              <div className="legend-indicator aura-indicator" />
              <div>
                <strong>Ischemic Myocardial Aura:</strong> Pulsing red wireframe marks the distal
                territory suffering from tissue hypoxia and reduced contractility.
              </div>
            </li>
            <li>
              <div className="legend-indicator pulse-indicator" />
              <div>
                <strong>Systolic Pulse Rhythm:</strong> Simulates regular cardiac contraction
                (can be toggled on/off in toolbar).
              </div>
            </li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

function VesselReadout({
  name,
  prediction,
}: {
  name: string;
  prediction?: TargetPrediction;
}) {
  if (!prediction) {
    return (
      <div className="readout empty">
        <p>No model output yet. Run an analysis to view risk assessment for {name}.</p>
      </div>
    );
  }

  const isPos = prediction.label === "positive";

  return (
    <div className={`readout ${isPos ? "positive" : "negative"}`}>
      <div className="readout-header">
        <span className={isPos ? "status-positive" : "status-negative"}>
          {isPos ? "Elevated Stenosis Risk" : "Low / Normal Risk"}
        </span>
        <strong className="readout-score">{Math.round(prediction.probability * 100)}%</strong>
      </div>
      <p className="readout-meta">
        Decision Threshold: {prediction.threshold != null ? `${(prediction.threshold * 100).toFixed(0)}%` : "0.50 default"} | Model
        Class: {prediction.predicted_class}
      </p>
    </div>
  );
}
