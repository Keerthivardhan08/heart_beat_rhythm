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
  const [selectedCaseId, setSelectedCaseId] = useState<string>("lad-isolated");
  const [activeTab, setActiveTab] = useState<"cases" | "details">("cases");

  const currentCase = CLINICAL_CASES.find((c) => c.id === selectedCaseId) || CLINICAL_CASES[0];

  // If a case is selected, use its predictions for the 3D heart if live predictions not provided
  const activePredictions = predictions || currentCase.predictions;
  const activeStenosisTarget = currentCase.vessel !== "cad" ? currentCase.vessel : selected;
  const activeDetail = vesselDetails[selected] ?? vesselDetails.lad;

  const handleSelectCase = (c: ClinicalCase) => {
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
            <span className="case-tag">CLINICAL SCENARIO PRESETS</span>
            <h4>Select an Artery Pathology Case to inspect 3D lesion & flow animation:</h4>
          </div>
          <div className="active-case-badge">
            <span className="live-dot" /> {currentCase.badge}
          </div>
        </div>

        <div className="cases-pill-list">
          {CLINICAL_CASES.map((c) => {
            const isCaseActive = c.id === selectedCaseId;
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
            stenosisSeverity={currentCase.stenosisSeverity}
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
              Active Case Analysis
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
                <p className="eyebrow">PATHOLOGY PROFILE</p>
                <h3>{currentCase.name}</h3>
                <p className="case-desc">{currentCase.description}</p>
              </div>

              {/* Stenosis Severity Meter */}
              <div className="severity-meter-box">
                <div className="meter-label">
                  <span>Luminal Stenosis Diameter</span>
                  <strong className={currentCase.stenosisSeverity >= 70 ? "text-danger" : "text-success"}>
                    {currentCase.stenosisSeverity}% Luminal Occlusion
                  </strong>
                </div>
                <div className="meter-track">
                  <div
                    className={`meter-fill ${currentCase.stenosisSeverity >= 70 ? "fill-danger" : "fill-success"}`}
                    style={{ width: `${currentCase.stenosisSeverity}%` }}
                  />
                </div>
              </div>

              {/* Case Diagnostic Highlights */}
              <div className="case-highlights-grid">
                <div className="highlight-item">
                  <span className="hl-label">Perfusion Zone</span>
                  <span className="hl-val">{currentCase.perfusionTerritory}</span>
                </div>
                <div className="highlight-item">
                  <span className="hl-label">ECG / Echo Finding</span>
                  <span className="hl-val">{currentCase.ecgFinding}</span>
                </div>
                <div className="highlight-item">
                  <span className="hl-label">Clinical Presentation</span>
                  <span className="hl-val">{currentCase.clinicalPresentation}</span>
                </div>
                <div className="highlight-item">
                  <span className="hl-label">Hemodynamic Impact</span>
                  <span className="hl-val">{currentCase.hemodynamicEffect}</span>
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
          <p>
            The viewer visualizes coronary artery problems in real-time WebGL:
          </p>
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
        <strong className="readout-score">
          {Math.round(prediction.probability * 100)}%
        </strong>
      </div>
      <p className="readout-meta">
        Decision Threshold: {prediction.threshold != null ? `${(prediction.threshold * 100).toFixed(0)}%` : "0.50 default"} | Model
        Class: {prediction.predicted_class}
      </p>
    </div>
  );
}
