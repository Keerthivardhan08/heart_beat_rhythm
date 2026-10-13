import { useMemo, useState } from "react";
import { AnatomyViewer } from "../pages/AnatomyViewer";
import { ThreeHeartViewer } from "../components/ThreeHeartViewer";
import { Disclaimer } from "../components/Disclaimer";
import { PatientDataForm } from "../components/PatientDataForm";
import { PredictionCard } from "../components/PredictionCard";
import { defaultFeatureValues, featureGroups, featureManifest } from "../data/featureManifest";
import { requestPrediction } from "../services/api";
import type { PredictionResponse, TargetId } from "../types/api";

type Page = "overview" | "analysis" | "anatomy" | "quality";

const targetLabels: Record<TargetId, string> = {
  cad: "Overall CAD",
  lad: "LAD",
  lcx: "LCX",
  rca: "RCA",
};

export function App() {
  const [page, setPage] = useState<Page>("overview");
  const [selectedTarget, setSelectedTarget] = useState<TargetId>("lad");
  const [features, setFeatures] = useState(defaultFeatureValues);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="brand-mark">
          <div className="brand-icon">CV</div>
          <div>
            <strong>CardioVision 3D</strong>
            <span>AI coronary analysis</span>
          </div>
        </div>
        <nav aria-label="Main navigation">
          <button className={page === "overview" ? "active" : ""} onClick={() => setPage("overview")}>Overview</button>
          <button className={page === "analysis" ? "active" : ""} onClick={() => setPage("analysis")}>New Analysis</button>
          <button className={page === "anatomy" ? "active" : ""} onClick={() => setPage("anatomy")}>3D Viewer</button>
          <button className={page === "quality" ? "active" : ""} onClick={() => setPage("quality")}>Model Quality</button>
        </nav>
        <div className="sidebar-card">
          <strong>Research prototype</strong>
          <span>Predictions are model outputs, not diagnosis.</span>
        </div>
      </aside>

      <main className="workspace">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">AI-POWERED CORONARY ARTERY ANALYSIS</p>
            <h1>Welcome back, Dr. Keerthivardhan</h1>
          </div>
          <div className="search-shell">Search patient ID, report, or history...</div>
        </header>

        {page === "overview" && (
          <OverviewPage
            prediction={prediction}
            selectedTarget={selectedTarget}
            onSelectTarget={setSelectedTarget}
            onNewAnalysis={() => setPage("analysis")}
            onOpenViewer={() => setPage("anatomy")}
            loading={loading}
            error={error}
          />
        )}

        {page === "analysis" && (
          <section className="analysis-page">
            <div className="page-heading">
              <div>
                <p className="eyebrow">NEW ANALYSIS</p>
                <h2>Submit a complete provisional model feature set.</h2>
              </div>
              <button className="ghost" onClick={() => setFeatures(defaultFeatureValues())}>Load sample</button>
            </div>
            {featureGroups.map((group) => (
              <section className="panel feature-section" key={group}>
                <h3>{group}</h3>
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
                {loading ? "Running..." : "Run full model analysis"}
              </button>
            </div>
          </section>
        )}

        {page === "anatomy" && (
          <AnatomyViewer
            predictions={prediction?.predictions}
            selected={selectedTarget}
            onSelect={setSelectedTarget}
          />
        )}

        {page === "quality" && <QualityPage />}

        <Disclaimer />
      </main>
    </div>
  );
}

function OverviewPage({
  prediction,
  selectedTarget,
  onSelectTarget,
  onNewAnalysis,
  onOpenViewer,
  loading,
  error,
}: {
  prediction: PredictionResponse | null;
  selectedTarget: TargetId;
  onSelectTarget: (target: TargetId) => void;
  onNewAnalysis: () => void;
  onOpenViewer: () => void;
  loading: boolean;
  error: string | null;
}) {
  const selectedPrediction = prediction?.predictions[selectedTarget];

  return (
    <section className="dashboard-grid">
      <div className="hero-card panel">
        <div>
          <p className="eyebrow">LIVE WORKSPACE</p>
          <h2>Analyze. Visualize. Verify.</h2>
          <p>Run all four provisional model outputs, then inspect vessel-level status in the separate anatomy viewer.</p>
        </div>
        <button className="primary" onClick={onNewAnalysis}>{loading ? "Running..." : "New analysis"}</button>
      </div>

      <MetricTile title="Total analyses" value={prediction ? "1" : "0"} detail="Local session" />
      <MetricTile title="Model status" value={prediction ? "Loaded" : "Ready"} detail="Provisional artifact" />
      <MetricTile title="Targets" value="4" detail="CAD, LAD, LCX, RCA" />

      <section className="viewer-preview panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">3D CORONARY HEART VISUALIZATION</p>
            <h3>Interactive anatomy workspace</h3>
          </div>
          <button className="ghost" onClick={onOpenViewer}>Open viewer</button>
        </div>
        <ThreeHeartViewer
          predictions={prediction?.predictions}
          selected={selectedTarget}
          onSelect={onSelectTarget}
        />
      </section>

      <section className="results-panel panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">PREDICTION RESULTS</p>
            <h3>{selectedPrediction ? `${targetLabels[selectedTarget]} selected` : "Waiting for analysis"}</h3>
          </div>
        </div>
        <div className="prediction-list">
          {(Object.keys(targetLabels) as TargetId[]).map((target) => (
            <PredictionCard
              active={selectedTarget === target}
              key={target}
              title={targetLabels[target]}
              prediction={prediction?.predictions[target]}
              onSelect={() => onSelectTarget(target)}
            />
          ))}
        </div>
        {error && <p className="error-text">{error}</p>}
        {!prediction && !error && <p>Run a new analysis to populate model outputs. No mock results are shown here.</p>}
      </section>

      <section className="panel patient-card">
        <p className="eyebrow">PATIENT INFORMATION</p>
        <h3>Demo sample</h3>
        <dl>
          <dt>Dataset</dt><dd>Z-Alizadeh Sani extension candidate</dd>
          <dt>Input fields</dt><dd>52 model features</dd>
          <dt>Use</dt><dd>Research and education only</dd>
        </dl>
        <button className="primary" onClick={onNewAnalysis}>Edit inputs</button>
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

function QualityPage() {
  return (
    <section className="panel quality-page">
      <p className="eyebrow">MODEL QUALITY</p>
      <h2>Evaluation before claims.</h2>
      <p>
        The downloaded bundle records train/test row counts and provisional status. Final metrics, calibration and
        explanation artifacts still need a documented evaluation pass before any public claim.
      </p>
    </section>
  );
}
