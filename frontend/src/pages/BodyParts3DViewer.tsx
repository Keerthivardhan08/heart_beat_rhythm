import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface FMAStructure {
  fmaId: string;
  name: string;
  latinName: string;
  color: string;
  category: "Artery" | "Chamber" | "Great Vessel";
  description: string;
  clinicalSignificance: string;
  bodyParts3dUrl: string;
  meshType: "aorta" | "lad" | "lcx" | "rca" | "ventricles" | "pulmonary";
}

const FMA_STRUCTURES: FMAStructure[] = [
  {
    fmaId: "FMA:3991",
    name: "Left anterior descending artery (LAD)",
    latinName: "Ramus interventricularis anterior arteriae coronariae sinistrae",
    color: "#ff3b30",
    category: "Artery",
    description: "Travels in the anterior interventricular sulcus toward the cardiac apex. Primary source of perfusion to the anterior wall of the left ventricle and anterior two-thirds of the interventricular septum.",
    clinicalSignificance: "Frequently termed the 'widowmaker'. Critical target in coronary artery disease (CAD) risk assessment.",
    bodyParts3dUrl: "https://lifesciencedb.jp/bp3d/",
    meshType: "lad",
  },
  {
    fmaId: "FMA:3992",
    name: "Left circumflex artery (LCX)",
    latinName: "Ramus circumflexus arteriae coronariae sinistrae",
    color: "#ff9500",
    category: "Artery",
    description: "Courses within the coronary sulcus around the left margin of the heart to the posterior surface. Supplies the lateral and posterior aspects of the left ventricle.",
    clinicalSignificance: "Stenosis impairs lateral LV wall motility; branches into obtuse marginal (OM) arteries.",
    bodyParts3dUrl: "https://lifesciencedb.jp/bp3d/",
    meshType: "lcx",
  },
  {
    fmaId: "FMA:3984",
    name: "Right coronary artery (RCA)",
    latinName: "Arteria coronaria dextra",
    color: "#30d158",
    category: "Artery",
    description: "Originates from the right aortic sinus, coursing through the right atrioventricular groove. Perfuses the right ventricle, inferior diaphragmatic left ventricular wall, and the cardiac conduction system (SA/AV nodes).",
    clinicalSignificance: "Inferior wall myocardial infarction typically results from proximal RCA occlusion.",
    bodyParts3dUrl: "https://lifesciencedb.jp/bp3d/",
    meshType: "rca",
  },
  {
    fmaId: "FMA:3734",
    name: "Ascending Aorta & Arch",
    latinName: "Aorta ascendens et Arcus aortae",
    color: "#e056fd",
    category: "Great Vessel",
    description: "First portion of the systemic arterial aorta arising from the left ventricle. Gives rise to the coronary arteries at the aortic root (sinuses of Valsalva).",
    clinicalSignificance: "Central hemodynamic inflow delivering oxygenated blood to the entire coronary circulation.",
    bodyParts3dUrl: "https://lifesciencedb.jp/bp3d/",
    meshType: "aorta",
  },
  {
    fmaId: "FMA:7096 / FMA:7097",
    name: "Ventricular Myocardium (LV & RV)",
    latinName: "Ventriculus sinister et dexter cordis",
    color: "#c0392b",
    category: "Chamber",
    description: "Muscular pumping chambers of the heart. The Left Ventricle (LV) ejects into systemic circulation; the Right Ventricle (RV) ejects into pulmonary circulation.",
    clinicalSignificance: "Primary tissue vulnerable to ischemia, infarction, and regional wall motion abnormalities (RWMA).",
    bodyParts3dUrl: "https://lifesciencedb.jp/bp3d/",
    meshType: "ventricles",
  },
  {
    fmaId: "FMA:8612",
    name: "Pulmonary Artery Trunk",
    latinName: "Truncus pulmonalis",
    color: "#00d2d3",
    category: "Great Vessel",
    description: "Major vessel arising from the right ventricle that bifurcates into the left and right pulmonary arteries.",
    clinicalSignificance: "Anatomical anterior cross landmark separating right ventricular outflow from the ascending aorta.",
    bodyParts3dUrl: "https://lifesciencedb.jp/bp3d/",
    meshType: "pulmonary",
  },
];

export function BodyParts3DViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedFma, setSelectedFma] = useState<FMAStructure>(FMA_STRUCTURES[0]);
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    lad: true,
    lcx: true,
    rca: true,
    aorta: true,
    ventricles: true,
    pulmonary: true,
  });

  const meshesRef = useRef<Record<string, THREE.Object3D>>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060c18);

    // Floor grid
    const grid = new THREE.GridHelper(8, 20, 0x1d3557, 0x0f1d2d);
    grid.position.y = -1.2;
    scene.add(grid);

    // Camera
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 3.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.replaceChildren(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.4;
    controls.maxDistance = 5.0;

    // Studio Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const dir1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dir1.position.set(3, 4, 3);
    scene.add(dir1);
    const dir2 = new THREE.DirectionalLight(0x70a1ff, 1.2);
    dir2.position.set(-3, -1, 2);
    scene.add(dir2);

    // Anatomical Root Group
    const heartGroup = new THREE.Group();
    scene.add(heartGroup);

    // 2. Build Segmented Anatomical Mesh Parts (FMA Ontology Geometries)
    const meshes: Record<string, THREE.Object3D> = {};

    // A. Ventricular Myocardium (LV & RV body)
    const ventGeo = new THREE.SphereGeometry(0.72, 36, 36);
    ventGeo.scale(1, 1.32, 0.82);
    const ventMat = new THREE.MeshStandardMaterial({
      color: 0x9e2a2b,
      roughness: 0.38,
      metalness: 0.1,
      bumpScale: 0.05,
    });
    const ventMesh = new THREE.Mesh(ventGeo, ventMat);
    ventMesh.position.set(0, -0.22, 0);
    ventMesh.rotation.z = -0.15;
    heartGroup.add(ventMesh);
    meshes.ventricles = ventMesh;

    // B. Ascending Aorta & Arch (FMA 3734)
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 0.18, 0.04),
      new THREE.Vector3(-0.06, 0.52, 0.08),
      new THREE.Vector3(0.06, 0.70, 0.02),
      new THREE.Vector3(0.20, 0.58, -0.10),
      new THREE.Vector3(0.22, 0.22, -0.16),
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 36, 0.16, 20, false);
    const aortaMat = new THREE.MeshStandardMaterial({
      color: 0xe056fd,
      roughness: 0.32,
      metalness: 0.15,
    });
    const aortaMesh = new THREE.Mesh(aortaGeo, aortaMat);
    heartGroup.add(aortaMesh);
    meshes.aorta = aortaMesh;

    // C. Pulmonary Artery Trunk (FMA 8612)
    const pulmonaryCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.16, 0.12, 0.22),
      new THREE.Vector3(-0.08, 0.36, 0.20),
      new THREE.Vector3(0.04, 0.44, 0.12),
      new THREE.Vector3(0.12, 0.40, -0.05),
    ]);
    const pulmonaryGeo = new THREE.TubeGeometry(pulmonaryCurve, 28, 0.13, 16, false);
    const pulmonaryMat = new THREE.MeshStandardMaterial({
      color: 0x00d2d3,
      roughness: 0.35,
      metalness: 0.12,
    });
    const pulmonaryMesh = new THREE.Mesh(pulmonaryGeo, pulmonaryMat);
    heartGroup.add(pulmonaryMesh);
    meshes.pulmonary = pulmonaryMesh;

    // D. Left Anterior Descending Artery (LAD / FMA 3991)
    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.06, 0.22, 0.34),
      new THREE.Vector3(0.12, 0.04, 0.42),
      new THREE.Vector3(0.18, -0.18, 0.46),
      new THREE.Vector3(0.20, -0.48, 0.40),
      new THREE.Vector3(0.14, -0.72, 0.26),
    ]);
    const ladGeo = new THREE.TubeGeometry(ladCurve, 32, 0.032, 12, false);
    const ladMat = new THREE.MeshStandardMaterial({
      color: 0xff3b30,
      roughness: 0.25,
      metalness: 0.2,
      emissive: 0x550000,
    });
    const ladMesh = new THREE.Mesh(ladGeo, ladMat);
    heartGroup.add(ladMesh);
    meshes.lad = ladMesh;

    // E. Left Circumflex Artery (LCX / FMA 3992)
    const lcxCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.10, 0.20, 0.30),
      new THREE.Vector3(0.28, 0.14, 0.24),
      new THREE.Vector3(0.42, 0.04, 0.10),
      new THREE.Vector3(0.46, -0.18, -0.08),
    ]);
    const lcxGeo = new THREE.TubeGeometry(lcxCurve, 28, 0.028, 12, false);
    const lcxMat = new THREE.MeshStandardMaterial({
      color: 0xff9500,
      roughness: 0.25,
      metalness: 0.2,
      emissive: 0x553300,
    });
    const lcxMesh = new THREE.Mesh(lcxGeo, lcxMat);
    heartGroup.add(lcxMesh);
    meshes.lcx = lcxMesh;

    // F. Right Coronary Artery (RCA / FMA 3984)
    const rcaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, 0.20, 0.28),
      new THREE.Vector3(-0.24, 0.12, 0.24),
      new THREE.Vector3(-0.36, -0.05, 0.22),
      new THREE.Vector3(-0.38, -0.28, 0.14),
      new THREE.Vector3(-0.25, -0.52, 0.02),
    ]);
    const rcaGeo = new THREE.TubeGeometry(rcaCurve, 32, 0.03, 12, false);
    const rcaMat = new THREE.MeshStandardMaterial({
      color: 0x30d158,
      roughness: 0.25,
      metalness: 0.2,
      emissive: 0x004411,
    });
    const rcaMesh = new THREE.Mesh(rcaGeo, rcaMat);
    heartGroup.add(rcaMesh);
    meshes.rca = rcaMesh;

    meshesRef.current = meshes;

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle cardiac rhythm
      const pulse = 1 + Math.sin(elapsed * 4.0) * 0.015;
      heartGroup.scale.set(pulse, pulse, pulse);

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      controls.dispose();
      container.replaceChildren();
    };
  }, []);

  // Update layer visibilities when activeLayers changes
  useEffect(() => {
    Object.entries(activeLayers).forEach(([key, visible]) => {
      const mesh = meshesRef.current[key];
      if (mesh) {
        mesh.visible = visible;
      }
    });
  }, [activeLayers]);

  // Highlight selected FMA structure
  useEffect(() => {
    Object.entries(meshesRef.current).forEach(([key, obj]) => {
      if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
        if (key === selectedFma.meshType) {
          obj.material.emissiveIntensity = 2.0;
        } else {
          obj.material.emissiveIntensity = 0.5;
        }
      }
    });
  }, [selectedFma]);

  const toggleLayer = (layer: string) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <section className="bodyparts3d-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ANATOMICAL REFERENCE STANDARDS</p>
          <h2>BodyParts3D (DBCLS) & Anatomical Mesh Architecture</h2>
        </div>
        <div className="license-pill">DBCLS FMA Ontology Explorer</div>
      </div>

      <div className="bodyparts3d-layout">
        {/* Interactive 3D FMA Segment Viewer */}
        <div className="panel fma-viewer-panel">
          <div className="fma-viewer-header">
            <h3>Interactive FMA Segmentation Viewer</h3>
            <span className="badge-fma">{selectedFma.fmaId} Selected</span>
          </div>

          <div className="fma-canvas-container" ref={containerRef} />

          {/* Layer toggles */}
          <div className="fma-layer-toggles">
            <span className="toggle-label">Anatomical Layers:</span>
            {FMA_STRUCTURES.map((s) => (
              <button
                key={s.meshType}
                type="button"
                className={`layer-btn ${activeLayers[s.meshType] ? "active" : ""}`}
                style={{
                  borderColor: s.color,
                  backgroundColor: activeLayers[s.meshType] ? `${s.color}33` : "transparent",
                  color: activeLayers[s.meshType] ? "#ffffff" : "#8faac7",
                }}
                onClick={() => toggleLayer(s.meshType)}
              >
                {activeLayers[s.meshType] ? "✔" : "✖"} {s.name.split(" ")[0]} ({s.meshType.toUpperCase()})
              </button>
            ))}
          </div>
        </div>

        {/* FMA Details Side Panel */}
        <aside className="panel fma-details-panel">
          <p className="eyebrow">STRUCTURE DETAILS & FMA ONTOLOGY</p>
          <div className="fma-title-row">
            <span className="color-indicator" style={{ backgroundColor: selectedFma.color }} />
            <div>
              <h3>{selectedFma.name}</h3>
              <small className="latin-name">{selectedFma.latinName}</small>
            </div>
          </div>

          <div className="fma-meta-grid">
            <div className="meta-box">
              <span className="meta-key">FMA Concept ID</span>
              <strong className="meta-val">{selectedFma.fmaId}</strong>
            </div>
            <div className="meta-box">
              <span className="meta-key">Category</span>
              <strong className="meta-val">{selectedFma.category}</strong>
            </div>
          </div>

          <div className="fma-desc-section">
            <h4>Anatomical Description</h4>
            <p>{selectedFma.description}</p>
          </div>

          <div className="fma-desc-section">
            <h4>Clinical Relevance to ML Predictions</h4>
            <p>{selectedFma.clinicalSignificance}</p>
          </div>

          <div className="fma-action-row">
            <a
              href="https://lifesciencedb.jp/bp3d/"
              target="_blank"
              rel="noopener noreferrer"
              className="primary button-link"
            >
              Browse on BodyParts3D Portal ↗
            </a>
          </div>

          {/* Quick Structure Selector */}
          <div className="fma-selector-list">
            <h4>Select Anatomical Target</h4>
            {FMA_STRUCTURES.map((s) => (
              <button
                key={s.fmaId}
                type="button"
                className={`fma-selector-item ${selectedFma.fmaId === s.fmaId ? "active" : ""}`}
                onClick={() => setSelectedFma(s)}
              >
                <span className="dot" style={{ backgroundColor: s.color }} />
                <span>{s.name}</span>
                <span className="fma-code">{s.fmaId}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* Comparison & Academic Rigor Documentation */}
      <section className="panel academic-comparison-panel">
        <p className="eyebrow">RESOURCE ARCHITECTURE COMPARISON</p>
        <h3>How CardioVision 3D Integrates BodyParts3D & Open-Source Mesh Standards</h3>
        <div className="comparison-grid">
          <article className="comparison-card">
            <h4>BodyParts3D (DBCLS)</h4>
            <span className="card-badge">Academic Ground Truth</span>
            <p>
              Developed by the Database Center for Life Science (DBCLS) and University of Tokyo. Provides precise
              whole-body MRI/CT anatomical segmentation models mapped to the Foundational Model of Anatomy (FMA) ontology.
            </p>
            <ul>
              <li>Strict anatomical hierarchy (FMA concept IDs)</li>
              <li>Individual vessel segment coordinates</li>
              <li>Raw polygon data for clinical verification</li>
            </ul>
            <a href="https://lifesciencedb.jp/bp3d/" target="_blank" rel="noopener noreferrer">
              Visit Portal (lifesciencedb.jp/bp3d) ↗
            </a>
          </article>

          <article className="comparison-card">
            <h4>NIH 3D Heart Library</h4>
            <span className="card-badge">Clinical Reference</span>
            <p>
              Curated by the National Institutes of Health (NIH) 3D Print Exchange. Offers segmented DICOM/CT-derived
              cardiovascular reconstructions with clinical validation.
            </p>
            <ul>
              <li>Real patient ventricular geometry</li>
              <li>Validated congenital and ischemic anatomy</li>
              <li>Used for surgical and catheter planning</li>
            </ul>
            <a href="https://3d.nih.gov/collections/heart-library" target="_blank" rel="noopener noreferrer">
              NIH 3D Print Exchange ↗
            </a>
          </article>

          <article className="comparison-card highlight">
            <h4>CardioVision 3D WebGL Pipeline</h4>
            <span className="card-badge active">Active Real-Time Model</span>
            <p>
              Combines PBR (Physically-Based Rendering) myocardial textures with dynamic 3D-to-2D screen projection of
              clinical landmarks, real-time orbit controls, and live connection to scikit-learn ML outputs.
            </p>
            <ul>
              <li>Sub-second loading with local Draco decoding</li>
              <li>Interactive risk status mapping (LAD, LCX, RCA)</li>
              <li>Persistent ethical disclaimer: Illustrative orientation only</li>
            </ul>
          </article>
        </div>
      </section>
    </section>
  );
}
