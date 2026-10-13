import { ThreeHeartViewer } from "../components/ThreeHeartViewer";
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
}: {
  predictions?: Partial<Record<TargetId, TargetPrediction>>;
  selected: TargetId;
  onSelect: (target: TargetId) => void;
}) {
  const activeDetail = vesselDetails[selected] ?? vesselDetails.lad;

  return (
    <section className="anatomy-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">3D CLINICAL ANATOMY WORKSPACE</p>
          <h2>Interactive Coronary Anatomy & Target Perfusion Model</h2>
        </div>
        <div className="license-pill">WebGL 3D Anatomical Renderer Active</div>
      </div>

      <div className="viewer-layout">
        {/* Main 3D Stage */}
        <div className="viewer-stage panel">
          <ThreeHeartViewer
            predictions={predictions}
            selected={selected}
            onSelect={onSelect}
          />
        </div>

        {/* Selected Vessel Diagnostic Summary */}
        <aside className="panel vessel-panel">
          <p className="eyebrow">VESSEL STATUS & RISK SUMMARY</p>
          <h3>{vesselLabels[selected]}</h3>

          {selected === "cad" ? (
            <p>
              Overall CAD status integrates hemodynamic inputs across all 3
              coronary distributions. Select LAD, LCX, or RCA below to inspect
              individual vessel territories.
            </p>
          ) : (
            <VesselReadout
              name={vesselLabels[selected]}
              prediction={predictions?.[selected]}
            />
          )}

          {/* Quick Switcher Buttons */}
          <div className="vessel-list">
            {(["lad", "lcx", "rca", "cad"] as TargetId[]).map((target) => {
              const p = predictions?.[target];
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

          {/* Anatomical Perfusion Reference */}
          <div className="anatomy-card-facts">
            <p className="fact-title">Myocardial Perfusion Territory</p>
            <p className="fact-desc">{activeDetail.perfusion}</p>

            <p className="fact-title">Clinical Significance</p>
            <p className="fact-desc">{activeDetail.significance}</p>

            <p className="fact-title">Average Anatomical Caliber</p>
            <p className="fact-desc">{activeDetail.normalLength}</p>
          </div>
        </aside>

        {/* Asset Attribution & Provenance Panel */}
        <aside className="panel asset-panel">
          <p className="eyebrow">MODEL PROVENANCE & GOVERNANCE</p>
          <h3>Anatomical Structure Reference</h3>
          <p>
            CardioVision 3D utilizes high-resolution 3D anatomical surface
            geometry rendered in real time with hardware-accelerated WebGL.
          </p>
          <ul>
            <li>
              <strong>Chambers:</strong> Right Ventricle (RV), Left Ventricle
              (LV), Aortic Root & Arch.
            </li>
            <li>
              <strong>Arteries:</strong> Left Anterior Descending (LAD), Left
              Circumflex (LCX), Right Coronary (RCA), Left Main Coronary Artery.
            </li>
            <li>
              <strong>Caveat:</strong> Model outputs indicate statistical risk of
              significant stenosis ($\ge 50\%$) from tabular clinical features;
              they do not represent physical patient-specific lesion geometry or
              intravascular ultrasound.
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
