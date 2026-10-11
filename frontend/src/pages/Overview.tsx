
export function Overview({ onNewAnalysis }: { onNewAnalysis: () => void }) {
  return (
    <section>
      <p className="eyebrow">CARDIOVASCULAR ML WORKSPACE</p>
      <h2>Explore model outputs with transparency.</h2>
      <p className="lead">
        A research prototype combining leakage-aware machine learning,
        explainability, and coronary anatomy visualization.
      </p>
      <div className="card-grid">
        <article className="panel"><h3>ML pipeline</h3><p>Not configured until a model is trained and evaluated.</p></article>
        <article className="panel"><h3>3D anatomy</h3><p>Viewer placeholder; licensed anatomy and vessel mapping are pending.</p></article>
        <article className="panel"><h3>Model quality</h3><p>Metrics will appear after evaluation has been completed.</p></article>
      </div>
      <button className="primary" onClick={onNewAnalysis}>Open new analysis</button>
    </section>
  );
}
