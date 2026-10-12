import { useState } from "react";
import type { PointerEvent } from "react";
import type { TargetId, TargetPrediction } from "../types/api";

const vesselLabels: Record<TargetId, string> = {
  cad: "Overall CAD",
  lad: "LAD",
  lcx: "LCX",
  rca: "RCA",
};

const vesselPaths: Record<Exclude<TargetId, "cad">, string> = {
  lad: "M 228 168 C 210 218 207 270 188 334",
  lcx: "M 224 178 C 164 196 132 240 116 292",
  rca: "M 278 176 C 336 215 352 282 330 350",
};

function vesselClass(prediction?: TargetPrediction) {
  if (!prediction) return "vessel unavailable";
  return prediction.label === "positive" ? "vessel positive" : "vessel negative";
}

export function AnatomyViewer({
  predictions,
  selected,
  onSelect,
}: {
  predictions?: Partial<Record<TargetId, TargetPrediction>>;
  selected: TargetId;
  onSelect: (target: TargetId) => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [dragStart, setDragStart] = useState<number | null>(null);

  const beginRotate = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStart(event.clientX);
  };

  const rotateFromDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart === null) return;
    setRotation((current) => current + (event.clientX - dragStart) * 0.35);
    setDragStart(event.clientX);
  };

  const endRotate = () => setDragStart(null);

  return (
    <section className="anatomy-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">3D ANATOMY VIEWER</p>
          <h2>Illustrative coronary anatomy, separate from prediction logic.</h2>
        </div>
        <div className="license-pill">GLB asset slot ready</div>
      </div>

      <div className="viewer-layout">
        <div className="viewer-stage panel">
          <div className="viewer-toolbar">
            <button type="button" onClick={() => setRotation((value) => value - 25)}>Rotate left</button>
            <button type="button" onClick={() => setRotation((value) => value + 25)}>Rotate right</button>
            <button type="button" onClick={() => setZoom((value) => Math.min(1.35, value + 0.1))}>Zoom in</button>
            <button type="button" onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))}>Zoom out</button>
            <button
              type="button"
              onClick={() => {
                setRotation(0);
                setZoom(1);
              }}
            >
              Reset
            </button>
          </div>
          <div
            className="viewer-rotator"
            onPointerDown={beginRotate}
            onPointerMove={rotateFromDrag}
            onPointerUp={endRotate}
            onPointerCancel={endRotate}
          >
            <svg
              className="heart-schematic"
              style={{ transform: `scale(${zoom}) rotateY(${rotation}deg)` }}
              viewBox="0 0 460 460"
              role="img"
              aria-label="Illustrative coronary artery viewer"
            >
            <defs>
              <radialGradient id="heartGlow" cx="45%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ff8c9a" />
                <stop offset="55%" stopColor="#dc334f" />
                <stop offset="100%" stopColor="#7e1432" />
              </radialGradient>
              <filter id="softShadow">
                <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#000817" floodOpacity="0.55" />
              </filter>
            </defs>
            <path
              className="heart-body"
              filter="url(#softShadow)"
              d="M230 393 C136 323 84 245 103 169 C119 105 182 92 230 139 C278 92 341 105 357 169 C376 245 324 323 230 393 Z"
              fill="url(#heartGlow)"
            />
            <path className="great-vessel blue" d="M205 132 C187 72 126 64 104 111 C137 94 170 108 190 148" />
            <path className="great-vessel blue" d="M276 132 C300 73 361 69 382 118 C346 96 315 111 294 151" />
            <path className="great-vessel red" d="M232 137 C232 88 254 58 294 50 C276 82 286 111 315 146" />
            {(Object.keys(vesselPaths) as Array<Exclude<TargetId, "cad">>).map((vessel) => (
              <g
                className="svg-button"
                key={vessel}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(vessel)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") onSelect(vessel);
                }}
              >
                <path
                  className={`${vesselClass(predictions?.[vessel])} ${selected === vessel ? "selected" : ""}`}
                  d={vesselPaths[vessel]}
                />
              </g>
            ))}
            </svg>
          </div>
          <label className="zoom-slider">
            <span>Zoom</span>
            <input
              type="range"
              min="0.8"
              max="1.35"
              step="0.01"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </label>
          <p className="viewer-note">
            This is an illustrative viewer until a licensed GLB with verified LAD/LCX/RCA mesh IDs is placed in
            frontend/public/models.
          </p>
        </div>

        <aside className="panel vessel-panel">
          <p className="eyebrow">VESSEL STATUS</p>
          <h3>{vesselLabels[selected]}</h3>
          {selected === "cad" ? (
            <p>CAD is shown in the result summary. The anatomy panel focuses on LAD, LCX and RCA orientation.</p>
          ) : (
            <VesselReadout prediction={predictions?.[selected]} />
          )}
          <div className="vessel-list">
            {(["lad", "lcx", "rca"] as TargetId[]).map((target) => (
              <button
                className={selected === target ? "active" : ""}
                key={target}
                type="button"
                onClick={() => onSelect(target)}
              >
                <span>{vesselLabels[target]}</span>
                <strong>{predictions?.[target]?.label ?? "pending"}</strong>
              </button>
            ))}
          </div>
        </aside>

        <aside className="panel asset-panel">
          <p className="eyebrow">LICENSED ASSET PLAN</p>
          <h3>Best-fit renderer</h3>
          <p>
            Use Three.js or React Three Fiber once the team selects a licensed GLB. The app should record source,
            author, license, file name and verified mesh mapping before demoing it as anatomy.
          </p>
          <ul>
            <li>Candidate: NIH 3D Heart Library, license varies by model.</li>
            <li>Candidate: Sketchfab coronary artery model, Creative Commons Attribution.</li>
            <li>Candidate: CC0 GLB heart asset for neutral base anatomy.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}

function VesselReadout({ prediction }: { prediction?: TargetPrediction }) {
  if (!prediction) {
    return <p>No model output yet. Run an analysis to update this vessel.</p>;
  }

  return (
    <div className="readout">
      <span className={prediction.label === "positive" ? "status-positive" : "status-negative"}>
        {prediction.label}
      </span>
      <strong>{Math.round(prediction.probability * 100)}%</strong>
      <p>
        Predicted class: {prediction.predicted_class}. Threshold status: {prediction.threshold_status}.
      </p>
    </div>
  );
}
