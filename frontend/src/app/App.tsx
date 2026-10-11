
import { useState } from "react";
import { Overview } from "../pages/Overview";
import { NewAnalysis } from "../pages/NewAnalysis";
import { ModelQuality } from "../pages/ModelQuality";
import { Disclaimer } from "../components/Disclaimer";

type Page = "overview" | "analysis" | "quality";

export function App() {
  const [page, setPage] = useState<Page>("overview");
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">RESEARCH PROTOTYPE</p>
          <h1>CardioVision <span>3D</span></h1>
        </div>
        <nav aria-label="Main navigation">
          <button onClick={() => setPage("overview")}>Overview</button>
          <button onClick={() => setPage("analysis")}>New analysis</button>
          <button onClick={() => setPage("quality")}>Model quality</button>
        </nav>
      </header>
      <main>
        {page === "overview" && <Overview onNewAnalysis={() => setPage("analysis")} />}
        {page === "analysis" && <NewAnalysis />}
        {page === "quality" && <ModelQuality />}
      </main>
      <Disclaimer />
      <footer>CardioVision 3D · Research and educational use only</footer>
    </div>
  );
}
