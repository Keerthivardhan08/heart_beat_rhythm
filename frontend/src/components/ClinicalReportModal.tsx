import type { PredictionResponse, TargetId } from "../types/api";

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: PredictionResponse | null;
  features: Record<string, number>;
}

const targetNames: Record<TargetId, string> = {
  cad: "Overall Coronary Artery Disease (CAD)",
  lad: "Left Anterior Descending Artery (LAD)",
  lcx: "Left Circumflex Artery (LCX)",
  rca: "Right Coronary Artery (RCA)",
};

export function ClinicalReportModal({
  isOpen,
  onClose,
  prediction,
  features,
}: ClinicalReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const age = features.Age ?? 58;
  const sex = features.Sex === 0 ? "Female" : "Male";
  const bp = features.BP ?? 130;
  const hr = features.PR ?? 76;
  const bmi = features.BMI ?? 27;
  const ef = features["EF-TTE"] ?? 55;

  const predictions = prediction?.predictions;
  const explanations = prediction?.explanations;

  // Check if any major vessel is high risk
  const hasHighRiskVessel =
    predictions &&
    (predictions.lad?.label === "positive" ||
      predictions.lcx?.label === "positive" ||
      predictions.rca?.label === "positive" ||
      predictions.cad?.label === "positive");

  return (
    <div className="report-modal-backdrop" onClick={onClose}>
      <div className="report-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Toolbar (hidden during print) */}
        <div className="report-modal-toolbar no-print">
          <div className="toolbar-left">
            <span className="badge-official">CardioVision 3D Report</span>
            <span>Generated on {currentDate}</span>
          </div>
          <div className="toolbar-right">
            <button className="primary print-btn" onClick={handlePrint} type="button">
              🖨 Print / Save as PDF
            </button>
            <button className="ghost close-btn" onClick={onClose} type="button">
              ✕ Close
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="report-document">
          {/* Header */}
          <header className="report-header">
            <div className="institution-info">
              <div className="brand-badge-large">CV-3D</div>
              <div>
                <h2>CardioVision 3D Clinical Decision Support</h2>
                <p>Cardiovascular Multi-Target Diagnostic Intelligence & Coronary Risk Summary</p>
              </div>
            </div>
            <div className="report-meta-block">
              <div>
                <strong>Report Date:</strong> {currentDate}
              </div>
              <div>
                <strong>Time:</strong> {currentTime}
              </div>
              <div>
                <strong>Evaluation Status:</strong> Provisional Decision Support
              </div>
            </div>
          </header>

          <hr className="report-divider" />

          {/* Patient Profile & Baseline Vitals */}
          <section className="report-section">
            <h4 className="section-title">1. Patient Profile & Clinical Presentation</h4>
            <div className="patient-data-grid">
              <div className="data-cell">
                <span className="data-label">Age</span>
                <strong className="data-val">{age} years</strong>
              </div>
              <div className="data-cell">
                <span className="data-label">Biological Sex</span>
                <strong className="data-val">{sex}</strong>
              </div>
              <div className="data-cell">
                <span className="data-label">Blood Pressure</span>
                <strong className="data-val">{bp} mmHg</strong>
              </div>
              <div className="data-cell">
                <span className="data-label">Heart Rate (PR)</span>
                <strong className="data-val">{hr} bpm</strong>
              </div>
              <div className="data-cell">
                <span className="data-label">Body Mass Index</span>
                <strong className="data-val">{bmi} kg/m²</strong>
              </div>
              <div className="data-cell">
                <span className="data-label">Echo Ejection Fraction</span>
                <strong className="data-val">{ef}%</strong>
              </div>
            </div>

            <div className="symptoms-summary-box">
              <strong>Reported Symptoms & Risk Factors:</strong>{" "}
              {[
                features["Typical Chest Pain"] ? "Typical Chest Pain" : null,
                features.Dyspnea ? "Exertional Dyspnea" : null,
                features.HTN ? "Hypertension" : null,
                features.DM ? "Diabetes Mellitus" : null,
                features.DLP ? "Dyslipidemia" : null,
                features["Current Smoker"] ? "Active Smoking" : null,
                features["St Elevation"] ? "ECG ST Elevation" : null,
                features["Region RWMA"] ? "Regional Wall Motion Abnormality" : null,
              ]
                .filter(Boolean)
                .join(", ") || "No major conventional symptoms declared."}
            </div>
          </section>

          {/* Multi-Target Coronary Risk Matrix */}
          <section className="report-section">
            <h4 className="section-title">2. Multi-Target Coronary Stenosis Risk Assessment</h4>
            <p className="section-desc">
              AI estimates probability of clinically significant stenosis (≥50% diameter reduction by catheterization).
            </p>

            <table className="report-table">
              <thead>
                <tr>
                  <th>Vessel / Territory</th>
                  <th>Model Score</th>
                  <th>Risk Classification</th>
                  <th>Decision Threshold</th>
                  <th>Primary Contributing Factor</th>
                </tr>
              </thead>
              <tbody>
                {(["cad", "lad", "lcx", "rca"] as TargetId[]).map((target) => {
                  const pred = predictions?.[target];
                  const exp = explanations?.[target];
                  const isHigh = pred?.label === "positive";
                  const score = pred ? `${Math.round(pred.probability * 100)}%` : "N/A";
                  const topFactor = exp?.top_risk_factors?.[0]?.feature || "Baseline Profile";

                  return (
                    <tr key={target} className={isHigh ? "row-elevated" : "row-normal"}>
                      <td>
                        <strong>{targetNames[target]}</strong>
                      </td>
                      <td>
                        <strong className={isHigh ? "score-elevated" : "score-normal"}>
                          {score}
                        </strong>
                      </td>
                      <td>
                        <span className={`pill-status ${isHigh ? "pill-high" : "pill-low"}`}>
                          {isHigh ? "Elevated Stenosis Risk" : "Normal / Low Risk"}
                        </span>
                      </td>
                      <td>0.50 (Provisional)</td>
                      <td>{topFactor}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Clinical Insights & Recommended Actions */}
          <section className="report-section">
            <h4 className="section-title">3. Clinical Decision Support Recommendations</h4>
            <div className="recommendation-box">
              {hasHighRiskVessel ? (
                <>
                  <p className="rec-alert">
                    <strong>⚠️ Elevated Ischemic Risk Detected:</strong> Model predicts significant
                    luminal stenosis in one or more coronary branches.
                  </p>
                  <ul>
                    <li>
                      <strong>Cardiology Consult:</strong> Urgent referral to Interventional
                      Cardiology for diagnostic evaluation.
                    </li>
                    <li>
                      <strong>Anatomical Corroboration:</strong> Recommend Coronary Computed
                      Tomography Angiography (CCTA) or Invasive Coronary Angiogram (ICA).
                    </li>
                    <li>
                      <strong>Functional Testing:</strong> Consider stress echocardiography or FFR
                      (Fractional Flow Reserve) to assess hemodynamic relevance.
                    </li>
                    <li>
                      <strong>Guideline-Directed Medical Therapy (GDMT):</strong> Assess indication for
                      high-intensity statin, antiplatelet therapy, and blood pressure optimization.
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="rec-normal">
                    <strong>✓ Low Likelihood of Obstructive CAD:</strong> Model outputs indicate low
                    statistical probability of high-grade coronary stenosis.
                  </p>
                  <ul>
                    <li>
                      <strong>Conservative Management:</strong> Primary cardiovascular prevention,
                      lifestyle counseling, and routine annual metabolic screening.
                    </li>
                    <li>
                      <strong>Symptom Monitoring:</strong> Advise patient to seek emergency medical
                      attention if exertional chest discomfort or shortness of breath intensifies.
                    </li>
                  </ul>
                </>
              )}
            </div>
          </section>

          {/* Research Governance & Disclaimer */}
          <footer className="report-footer">
            <p className="disclaimer-text">
              <strong>REGULATORY DISCLAIMER:</strong> CardioVision 3D is an educational and research
              decision support prototype trained on the Z-Alizadeh Sani cardiac catheterization dataset.
              These statistical probability scores are intended solely for academic demonstration and pair-programming
              evaluation. They DO NOT constitute a formal clinical diagnosis, medical prescription, or definitive
              fluoroscopic angiographic finding. Clinical decisions must always be directed by licensed healthcare providers.
            </p>
            <div className="signature-line">
              <div>
                <span>Automated AI Report Engine: CardioVision 3D v0.1.0</span>
              </div>
              <div>
                <span>Physician / Reviewer Signature: _______________________</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
