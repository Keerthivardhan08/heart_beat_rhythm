import { useMemo, useState } from "react";
import { AnatomyViewer } from "../pages/AnatomyViewer";
import { BodyParts3DViewer } from "../pages/BodyParts3DViewer";
import { ModelQuality } from "../pages/ModelQuality";
import { ThreeHeartViewer } from "../components/ThreeHeartViewer";
import { Disclaimer } from "../components/Disclaimer";
import { PatientDataForm } from "../components/PatientDataForm";
import { PredictionCard } from "../components/PredictionCard";
import { FeatureExplanation } from "../components/FeatureExplanation";
import { ClinicalReportModal } from "../components/ClinicalReportModal";
import { CLINICAL_CASES } from "../data/clinicalCases";
import { defaultFeatureValues, featureGroups, featureManifest } from "../data/featureManifest";
import { requestPrediction } from "../services/api";
import type { PredictionResponse, TargetId } from "../types/api";

type Page = "overview" | "analysis" | "anatomy" | "bodyparts3d" | "quality";

const targetLabels: Record<TargetId, string> = {
  cad: "Overall CAD",
  lad: "LAD (Anterior)",
  lcx: "LCX (Lateral)",
  rca: "RCA (Inferior)",
};

export function App() {
  const [page, setPage] = useState<Page>("overview");
  const [selectedTarget, setSelectedTarget] = useState<TargetId>("lad");
  const [features, setFeatures] = useState<Record<string, number>>(defaultFeatureValues());
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const selectedFeatures = useMemo(() => {
    if (page === "analysis") return featureManifest;
    return featureManifest.filter((feature) => feature.group === "Profile" || feature.group === "Symptoms");
  }, [page]);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const result = await requestPrediction(features);
      setPrediction(result);
      setPage("overview");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Prediction failed.");
    } finally {
      setLoading(false);
    }
  }

  const applyPreset = (presetFeatures: Record<string, number>) => {
    setFeatures({ ...defaultFeatureValues(), ...presetFeatures });
  };

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="brand-mark">
          <div className="brand-icon">CV</div>
          <div>
            <strong>CardioVision 3D</strong>
            <span>AI Coronary Intelligence</span>
          </div>
        </div>
        <nav aria-label="Main navigation">
          <button className={page === "overview" ? "active" : ""} onClick={() => setPage("overview")}>
            Overview
          </button>
          <button className={page === "analysis" ? "active" : ""} onClick={() => setPage("analysis")}>
            New Analysis
          </button>
          <button className={page === "anatomy" ? "active" : ""} onClick={() => setPage("anatomy")}>
            3D Viewer
          </button>
          <button className={page === "bodyparts3d" ? "active" : ""} onClick={() => setPage("bodyparts3d")}>
            BodyParts3D (DBCLS)
          </button>
          <button className={page === "quality" ? "active" : ""} onClick={() => setPage("quality")}>
            Model Quality
          </button>
        </nav>

        <div className="sidebar-report-action">
          <button
            type="button"
            className="sidebar-export-btn"
            onClick={() => setIsReportOpen(true)}
            title="Generate printable clinical decision summary"
          >
            📄 Export Clinical Report
          </button>
        </div>

        <div className="sidebar-card">
          <div className="sidebar-card-badge">Decision Support</div>
          <strong>Research Prototype</strong>
          <span>Statistical ML probabilities; not for direct clinical therapy.</span>
        </div>
      </aside>

      <main className="workspace">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">AI-POWERED CORONARY ARTERY ANALYSIS</p>
            <h1>Clinical Cardiology Intelligence Center</h1>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="export-report-btn"
              onClick={() => setIsReportOpen(true)}
            >
              🖨 Generate Report
            </button>
            <div className="search-shell">Patient ID: #CV-2026-9041</div>
          </div>
        </header>

        {page === "overview" && (
          <OverviewPage
            prediction={prediction}
            selectedTarget={selectedTarget}
            onSelectTarget={setSelectedTarget}
            onNewAnalysis={() => setPage("analysis")}
            onOpenViewer={() => setPage("anatomy")}
            onOpenReport={() => setIsReportOpen(true)}
            loading={loading}
            error={error}
          />
        )}

        {page === "analysis" && (
          <section className="analysis-page">
            <div className="page-heading">
              <div>
                <p className="eyebrow">PATIENT FEATURE ENTRY & DIAGNOSTIC WORKBENCH</p>
                <h2>Configure Clinical Feature Set (52 Features)</h2>
              </div>
              <div className="quick-presets-group">
                <span className="preset-label">Quick Presets:</span>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => setFeatures(defaultFeatureValues())}
                >
                  Baseline
                </button>
                <button
                  type="button"
                  className="preset-btn btn-lad"
                  onClick={() => applyPreset(CLINICAL_CASES[0].sampleFeatures)}
                  title="Load 64yo male with high LAD risk (anterior MI)"
                >
                  LAD Infarct
                </button>
                <button
                  type="button"
                  className="preset-btn btn-lcx"
                  onClick={() => applyPreset(CLINICAL_CASES[1].sampleFeatures)}
                  title="Load 59yo female with LCX stenosis (lateral ischemia)"
                >
                  LCX Lateral
                </button>
                <button
                  type="button"
                  className="preset-btn btn-rca"
                  onClick={() => applyPreset(CLINICAL_CASES[2].sampleFeatures)}
                  title="Load 67yo male with RCA lesion (inferior & bradycardia)"
                >
                  RCA Inferior
                </button>
                <button
                  type="button"
                  className="preset-btn btn-normal"
                  onClick={() => applyPreset(CLINICAL_CASES[4].sampleFeatures)}
                  title="Load 42yo female with normal coronary arteries"
                >
                  Normal Patent
                </button>
              </div>
            </div>

            {featureGroups.map((group) => (
              <section className="panel feature-section" key={group}>
                <div className="section-title-row">
                  <h3>{group} Parameters</h3>
                  <span className="count-badge">
                    {selectedFeatures.filter((feature) => feature.group === group).length} features
                  </span>
                </div>
                <PatientDataForm
                  features={selectedFeatures.filter((feature) => feature.group === group)}
                  values={features}
                  disabled={loading}
                  onChange={(name, value) => setFeatures((current) => ({ ...current, [name]: value }))}
                  onSubmit={runAnalysis}
                  onReset={() => setFeatures(defaultFeatureValues())}
                />
              </section>
            ))}

            <div className="sticky-submit">
              {error && <span className="error-text">{error}</span>}
              <button className="primary" onClick={runAnalysis} disabled={loading}>
                {loading ? "Running AI Inference..." : "Run Full Model Analysis (4 Targets)"}
              </button>
            </div>
          </section>
        )}

        {page === "anatomy" && (
          <AnatomyViewer
            predictions={prediction?.predictions}
            selected={selectedTarget}
            onSelect={setSelectedTarget}
            onApplyCaseFeatures={(caseFeats) => {
              setFeatures((prev) => ({ ...prev, ...caseFeats }));
            }}
          />
        )}

        {page === "bodyparts3d" && <BodyParts3DViewer />}

        {page === "quality" && <ModelQuality />}

        <Disclaimer />
      </main>

      {/* Hospital-Grade Printable Clinical Report Modal */}
      <ClinicalReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        prediction={prediction}
        features={features}
      />
    </div>
  );
}

function OverviewPage({
  prediction,
  selectedTarget,
  onSelectTarget,
  onNewAnalysis,
  onOpenViewer,
  onOpenReport,
  loading,
  error,
}: {
  prediction: PredictionResponse | null;
  selectedTarget: TargetId;
  onSelectTarget: (target: TargetId) => void;
  onNewAnalysis: () => void;
  onOpenViewer: () => void;
  onOpenReport: () => void;
  loading: boolean;
  error: string | null;
}) {
  const selectedPrediction = prediction?.predictions[selectedTarget];
  const selectedExplanation = prediction?.explanations?.[selectedTarget];

  return (
    <section className="dashboard-grid">
      <div className="hero-card panel">
        <div>
          <p className="eyebrow">LIVE WORKSPACE</p>
          <h2>Analyze. Visualize. Verify.</h2>
          <p>
            Evaluate multi-target stenosis probabilities across LAD, LCX, and RCA distributions,
            then inspect live 3D hemodynamic blood flow animations.
          </p>
        </div>
        <div className="hero-button-group">
          <button className="primary" onClick={onNewAnalysis}>
            {loading ? "Running..." : "New Analysis"}
          </button>
          <button className="ghost" onClick={onOpenReport}>
            📄 Export Report
          </button>
        </div>
      </div>

      <MetricTile
        title="Session Analyses"
        value={prediction ? "1 Complete" : "0 Runs"}
        detail="Local inference active"
      />
      <MetricTile
        title="Model Pipeline"
        value="4 Calibrated"
        detail="Scikit-Learn Logistic"
      />
      <MetricTile
        title="Target Coverage"
        value="CAD, LAD, LCX, RCA"
        detail="Catheterization ground-truth"
      />

      {/* 3D Coronary Heart Preview */}
      <section className="viewer-preview panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">3D CORONARY ARTERY VISUALIZATION</p>
            <h3>Interactive Anatomy Workspace</h3>
          </div>
          <button className="ghost" onClick={onOpenViewer}>
            Expand 3D Workspace →
          </button>
        </div>
        <ThreeHeartViewer
          predictions={prediction?.predictions}
          selected={selectedTarget}
          onSelect={onSelectTarget}
        />
      </section>

      {/* Prediction Results & 4 Cards */}
      <section className="results-panel panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">PREDICTION RESULTS</p>
            <h3>
              {selectedPrediction
                ? `${targetLabels[selectedTarget]} Selected`
                : "Waiting for Clinical Analysis"}
            </h3>
          </div>
        </div>
        <div className="prediction-list">
          {(Object.keys(targetLabels) as TargetId[]).map((target) => (
            <PredictionCard
              active={selectedTarget === target}
              key={target}
              title={targetLabels[target]}
              prediction={prediction?.predictions[target]}
              explanation={prediction?.explanations?.[target]}
              onSelect={() => onSelectTarget(target)}
            />
          ))}
        </div>
        {error && <p className="error-text">{error}</p>}
        {!prediction && !error && (
          <p className="hint-text">
            Click <strong>New Analysis</strong> above or load a sample preset to run multi-target ML inference.
          </p>
        )}
      </section>

      {/* AI Feature Explainability Component */}
      <div className="explanation-wrapper">
        <FeatureExplanation
          targetName={targetLabels[selectedTarget]}
          explanation={selectedExplanation}
          probability={selectedPrediction?.probability}
        />
      </div>

      {/* Patient Information & Clinical Summary */}
      <section className="panel patient-card">
        <p className="eyebrow">PATIENT PROFILE SPECIFICATION</p>
        <h3>Active Case Record</h3>
        <dl>
          <dt>Registry</dt>
          <dd>Z-Alizadeh Sani Cardiovascular Cohort</dd>
          <dt>Feature Vector</dt>
          <dd>52 Demographics, Vitals, Labs & ECG Variables</dd>
          <dt>Ethical Boundary</dt>
          <dd>Educational & Research Pair-Programming Evaluation</dd>
        </dl>
        <div className="patient-card-actions">
          <button className="primary" onClick={onNewAnalysis}>
            Modify Features
          </button>
          <button className="ghost" onClick={onOpenReport}>
            Print Report
          </button>
        </div>
      </section>
    </section>
  );
}

function MetricTile({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <article className="metric-tile panel">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
