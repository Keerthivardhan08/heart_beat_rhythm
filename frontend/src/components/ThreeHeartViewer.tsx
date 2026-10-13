import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { TargetId, TargetPrediction } from "../types/api";

export interface Landmark {
  id: string;
  targetId?: TargetId;
  name: string;
  sublabel?: string;
  position: [number, number, number];
  align: "left" | "right";
  lineOffset: [number, number]; // 2D offset for callout label [dx, dy]
}

const LANDMARKS: Landmark[] = [
  {
    id: "aorta",
    name: "Aorta",
    position: [-0.04, 0.62, 0.14],
    align: "right",
    lineOffset: [60, -25],
  },
  {
    id: "lmca",
    name: "Left main coronary artery",
    position: [0.12, 0.26, 0.42],
    align: "right",
    lineOffset: [90, -10],
  },
  {
    id: "lad",
    targetId: "lad",
    name: "Left anterior descending artery (LAD)",
    sublabel: "Critical anterior wall perfusion",
    position: [0.22, -0.16, 0.52],
    align: "right",
    lineOffset: [80, 20],
  },
  {
    id: "lcx",
    targetId: "lcx",
    name: "Left circumflex artery (LCX)",
    sublabel: "Lateral wall branch",
    position: [0.46, 0.10, 0.26],
    align: "right",
    lineOffset: [85, -30],
  },
  {
    id: "lv",
    name: "Left ventricle",
    position: [0.18, -0.62, 0.38],
    align: "right",
    lineOffset: [70, 40],
  },
  {
    id: "rv",
    name: "Right ventricle",
    position: [-0.26, -0.36, 0.48],
    align: "left",
    lineOffset: [-80, 30],
  },
  {
    id: "rca",
    targetId: "rca",
    name: "Right coronary artery (RCA)",
    sublabel: "Inferior / posterior perfusion",
    position: [-0.42, 0.06, 0.38],
    align: "left",
    lineOffset: [-95, -15],
  },
];

interface ThreeHeartViewerProps {
  predictions?: Partial<Record<TargetId, TargetPrediction>>;
  selected: TargetId;
  onSelect: (target: TargetId) => void;
  stenosisVessel?: TargetId | null; // which artery has the animated blockage
  stenosisSeverity?: number; // 0 - 100%
  animationMode?: "pulse" | "ischemia" | "both";
}

export function ThreeHeartViewer({
  predictions,
  selected,
  onSelect,
  stenosisVessel = null,
  stenosisSeverity = 80,
  animationMode = "both",
}: ThreeHeartViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [heartbeatActive, setHeartbeatActive] = useState(true);
  const [modelChoice, setModelChoice] = useState<"heart" | "organ">("organ");
  const [showFlowParticles, setShowFlowParticles] = useState(true);

  // Track projected 2D screen coordinates of each landmark
  const [screenCoords, setScreenCoords] = useState<
    Record<string, { x: number; y: number; visible: boolean }>
  >({});

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const heartGroupRef = useRef<THREE.Group | null>(null);
  const vesselsGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  // Active stenosis target: defaults to prop, or if selected is lad/lcx/rca and is positive
  const activeStenosisTarget: TargetId | null =
    stenosisVessel !== undefined && stenosisVessel !== null
      ? stenosisVessel
      : predictions?.[selected]?.label === "positive" && selected !== "cad"
      ? selected
      : null;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    setLoading(true);
    setLoadError(null);

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090e); // Deep cinematic dark background

    // Subtle grid on floor
    const grid = new THREE.GridHelper(8, 24, 0x1d3557, 0x0f1d2d);
    grid.position.y = -1.35;
    scene.add(grid);

    // 2. Camera setup
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.15, 3.2);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.replaceChildren(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.4;
    controls.maxDistance = 5.5;
    controls.maxPolarAngle = Math.PI * 0.85;
    controls.minPolarAngle = Math.PI * 0.15;
    controlsRef.current = controls;

    // 5. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3, 4, 3.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x70a1ff, 1.2);
    fillLight.position.set(-3, -1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff6b81, 1.4);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // 6. Heart Group & Vessel Rig
    const heartGroup = new THREE.Group();
    scene.add(heartGroup);
    heartGroupRef.current = heartGroup;

    const vesselsGroup = new THREE.Group();
    heartGroup.add(vesselsGroup);
    vesselsGroupRef.current = vesselsGroup;

    // Build Coronary Artery Mesh Rig with Dynamic Stenosis Ring & Glow
    const arteryMaterials: Record<string, THREE.MeshStandardMaterial> = {};
    const occlusionRings: Record<string, THREE.Mesh> = {};
    const perfusionAuras: Record<string, THREE.Mesh> = {};

    const ladCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.08, 0.22, 0.35),
      new THREE.Vector3(0.14, 0.04, 0.43),
      new THREE.Vector3(0.20, -0.18, 0.47),
      new THREE.Vector3(0.22, -0.48, 0.41),
      new THREE.Vector3(0.16, -0.70, 0.28),
    ]);

    const lcxCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.10, 0.20, 0.32),
      new THREE.Vector3(0.26, 0.14, 0.25),
      new THREE.Vector3(0.42, 0.04, 0.12),
      new THREE.Vector3(0.46, -0.16, -0.06),
      new THREE.Vector3(0.38, -0.38, -0.16),
    ]);

    const rcaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.06, 0.20, 0.30),
      new THREE.Vector3(-0.24, 0.12, 0.25),
      new THREE.Vector3(-0.36, -0.04, 0.22),
      new THREE.Vector3(-0.38, -0.28, 0.14),
      new THREE.Vector3(-0.26, -0.50, 0.04),
    ]);

    const buildArteries = () => {
      vesselsGroup.clear();

      const vesselConfigs = [
        { id: "lad", curve: ladCurve, baseRadius: 0.030, lesionT: 0.45 },
        { id: "lcx", curve: lcxCurve, baseRadius: 0.027, lesionT: 0.40 },
        { id: "rca", curve: rcaCurve, baseRadius: 0.029, lesionT: 0.48 },
      ];

      vesselConfigs.forEach(({ id, curve, baseRadius, lesionT }) => {
        const isStenosed = activeStenosisTarget === id || (predictions?.[id as TargetId]?.label === "positive");
        const isTargetSelected = selected === id;

        // Dynamic material color
        const mat = new THREE.MeshStandardMaterial({
          color: isStenosed ? 0xff2a2a : isTargetSelected ? 0x00d2d3 : 0xff4d4d,
          roughness: 0.22,
          metalness: 0.25,
          emissive: isStenosed ? 0x770000 : 0x000000,
        });
        arteryMaterials[id] = mat;

        const geo = new THREE.TubeGeometry(curve, 36, baseRadius, 14, false);
        const mesh = new THREE.Mesh(geo, mat);
        vesselsGroup.add(mesh);

        // Lesion plaque / stenosis ring at obstruction point
        const lesionPos = curve.getPointAt(lesionT);
        const lesionTangent = curve.getTangentAt(lesionT);

        const ringGeo = new THREE.TorusGeometry(baseRadius * 1.5, baseRadius * 0.45, 12, 24);
        const ringMat = new THREE.MeshStandardMaterial({
          color: isStenosed ? 0xffea00 : 0x333333,
          roughness: 0.4,
          metalness: 0.3,
          emissive: isStenosed ? 0xff8800 : 0x000000,
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(lesionPos);
        ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), lesionTangent);
        ringMesh.visible = !!isStenosed;
        vesselsGroup.add(ringMesh);
        occlusionRings[id] = ringMesh;

        // Ischemic myocardial aura (glowing distal zone affected by blockage)
        const distalPos = curve.getPointAt(Math.min(lesionT + 0.35, 0.95));
        const auraGeo = new THREE.SphereGeometry(0.18, 16, 16);
        const auraMat = new THREE.MeshBasicMaterial({
          color: 0xff0044,
          transparent: true,
          opacity: isStenosed ? 0.38 : 0.0,
          wireframe: true,
        });
        const auraMesh = new THREE.Mesh(auraGeo, auraMat);
        auraMesh.position.copy(distalPos);
        auraMesh.visible = !!isStenosed;
        vesselsGroup.add(auraMesh);
        perfusionAuras[id] = auraMesh;
      });
    };

    buildArteries();

    // 7. Hemodynamic Blood Flow Particle Simulation
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleProgress = new Float32Array(particleCount); // 0 to 1
    const particleVesselIdx = new Int8Array(particleCount); // 0: lad, 1: lcx, 2: rca

    for (let i = 0; i < particleCount; i++) {
      particleProgress[i] = Math.random();
      particleVesselIdx[i] = i % 3;
      particlePositions[i * 3] = 0;
      particlePositions[i * 3 + 1] = 0;
      particlePositions[i * 3 + 2] = 0;

      // Initial red blood cell color
      particleColors[i * 3] = 1.0;
      particleColors[i * 3 + 1] = 0.2;
      particleColors[i * 3 + 2] = 0.2;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.038,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    vesselsGroup.add(particles);
    particlesRef.current = particles;

    // 8. Load 3D Cardiac Mesh
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    loader.setDRACOLoader(dracoLoader);

    const modelPath = modelChoice === "heart" ? "/models/heart.glb" : "/models/heart-organ.glb";

    // Helper: Mount and center base heart model
    const mountModel = (root: THREE.Object3D) => {
      // Keep vessels intact while updating root organ mesh
      const existingHeartMesh = heartGroup.getObjectByName("organMeshWrapper");
      if (existingHeartMesh) heartGroup.remove(existingHeartMesh);

      // Disable stray Blender lights/cameras
      root.traverse((child: any) => {
        if (child.isLight || child.isCamera) {
          child.visible = false;
        }
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.side = THREE.DoubleSide;
            child.material.roughness = 0.42;
            child.material.metalness = 0.08;
          }
        }
      });

      // Compute bounding box strictly across meshes
      const box = new THREE.Box3();
      let meshFound = false;
      root.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          box.expandByObject(child);
          meshFound = true;
        }
      });

      if (!meshFound) {
        box.setFromObject(root);
      }

      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const targetScale = 2.15 / maxDim;

      // Wrapper group to ensure rotation & scaling anchor exactly at origin
      const wrapper = new THREE.Group();
      wrapper.name = "organMeshWrapper";
      wrapper.add(root);

      root.position.set(-center.x, -center.y, -center.z);
      wrapper.scale.setScalar(targetScale);

      heartGroup.add(wrapper);
      setLoading(false);
      setLoadError(null);
    };

    // Fallback Procedural Anatomical Heart Mesh
    const createProceduralHeart = () => {
      const proceduralGroup = new THREE.Group();

      // Ventricular body
      const ventGeo = new THREE.SphereGeometry(0.72, 32, 32);
      ventGeo.scale(1, 1.35, 0.85);
      const ventMat = new THREE.MeshStandardMaterial({
        color: 0xa8283d,
        roughness: 0.35,
        metalness: 0.1,
      });
      const ventMesh = new THREE.Mesh(ventGeo, ventMat);
      ventMesh.position.set(0, -0.25, 0);
      ventMesh.rotation.z = -0.15;
      proceduralGroup.add(ventMesh);

      // Aorta arch
      const aortaCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.05, 0.2, 0.05),
        new THREE.Vector3(-0.08, 0.55, 0.08),
        new THREE.Vector3(0.08, 0.72, 0.02),
        new THREE.Vector3(0.22, 0.58, -0.1),
        new THREE.Vector3(0.24, 0.25, -0.15),
      ]);
      const aortaGeo = new THREE.TubeGeometry(aortaCurve, 32, 0.15, 16, false);
      const aortaMat = new THREE.MeshStandardMaterial({
        color: 0xdb6576,
        roughness: 0.3,
        metalness: 0.1,
      });
      proceduralGroup.add(new THREE.Mesh(aortaGeo, aortaMat));

      mountModel(proceduralGroup);
    };

    createProceduralHeart();

    loader.load(
      modelPath,
      (gltf) => {
        mountModel(gltf.scene);
      },
      undefined,
      (err) => {
        console.warn(`Error loading model ${modelPath}, trying alternate:`, err);
        const fallbackPath =
          modelPath === "/models/heart.glb" ? "/models/heart-organ.glb" : "/models/heart.glb";
        loader.load(
          fallbackPath,
          (gltfFallback) => {
            mountModel(gltfFallback.scene);
          },
          undefined,
          (err2) => {
            console.error("Models failed, fallback active:", err2);
            createProceduralHeart();
          }
        );
      }
    );

    // 9. Render & Animation Loop
    let clock = new THREE.Clock();
    const curves = [ladCurve, lcxCurve, rcaCurve];
    const curveKeys: TargetId[] = ["lad", "lcx", "rca"];

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Systolic heartbeat pulse
      if (heartbeatActive && heartGroup) {
        const pulse = 1 + Math.sin(elapsed * 4.2) * 0.022;
        heartGroup.scale.set(pulse, pulse, pulse);
      }

      // Animate Stenosis Lesion Rings & Ischemic Auras
      curveKeys.forEach((id) => {
        const ring = occlusionRings[id];
        const aura = perfusionAuras[id];
        const isStenosed =
          activeStenosisTarget === id || predictions?.[id]?.label === "positive";

        if (ring && ring.visible) {
          // Warning pulsation scale
          const ringPulse = 1 + Math.sin(elapsed * 6.5) * 0.25;
          ring.scale.set(ringPulse, ringPulse, ringPulse);
        }

        if (aura && aura.visible) {
          // Ischemic tissue hypoxia flicker
          const auraPulse = 1 + Math.sin(elapsed * 3.5) * 0.18;
          aura.scale.set(auraPulse, auraPulse, auraPulse);
          (aura.material as THREE.MeshBasicMaterial).opacity =
            0.25 + Math.sin(elapsed * 4.0) * 0.15;
        }

        const mat = arteryMaterials[id];
        if (mat) {
          if (isStenosed) {
            mat.emissive.setHex(0x990000);
            mat.emissiveIntensity = 0.6 + Math.sin(elapsed * 5.0) * 0.4;
          } else {
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
          }
        }
      });

      // Animate Hemodynamic Blood Flow Particles
      if (showFlowParticles && particlesRef.current) {
        const positions = particleGeo.attributes.position.array as Float32Array;
        const colors = particleGeo.attributes.color.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          const vIdx = particleVesselIdx[i];
          const vesselId = curveKeys[vIdx];
          const isStenosed =
            activeStenosisTarget === vesselId || predictions?.[vesselId]?.label === "positive";

          // Severe stenosis slows velocity across the lesion
          const speed = isStenosed ? 0.0035 : 0.009;
          particleProgress[i] = (particleProgress[i] + speed) % 1.0;

          const t = particleProgress[i];
          const c = curves[vIdx];
          const pt = c.getPointAt(t);

          positions[i * 3] = pt.x;
          positions[i * 3 + 1] = pt.y;
          positions[i * 3 + 2] = pt.z;

          // Color change: stenosed turns amber/cyan hypoxia warning distal to lesion
          if (isStenosed && t > 0.45) {
            colors[i * 3] = 0.2; // R
            colors[i * 3 + 1] = 0.7; // G
            colors[i * 3 + 2] = 1.0; // B (cyan hypoxic blood)
          } else {
            colors[i * 3] = 1.0; // R
            colors[i * 3 + 1] = 0.2; // G
            colors[i * 3 + 2] = 0.2; // B (oxygenated red blood)
          }
        }

        particleGeo.attributes.position.needsUpdate = true;
        particleGeo.attributes.color.needsUpdate = true;
      }

      controls.update();
      renderer.render(scene, camera);

      // Project 3D landmarks to 2D screen positions
      const newCoords: Record<string, { x: number; y: number; visible: boolean }> = {};
      const tempVec = new THREE.Vector3();

      LANDMARKS.forEach((lm) => {
        tempVec.set(...lm.position);
        tempVec.applyMatrix4(heartGroup.matrixWorld);

        const toCam = camera.position.clone().sub(tempVec).normalize();
        const normalApprox = tempVec.clone().normalize();
        const dot = normalApprox.dot(toCam);

        tempVec.project(camera);

        const x = ((tempVec.x + 1) * width) / 2;
        const y = ((-tempVec.y + 1) * height) / 2;
        const inFrustum = tempVec.z < 1.0;

        newCoords[lm.id] = {
          x,
          y,
          visible: inFrustum && dot > -0.2,
        };
      });

      setScreenCoords(newCoords);
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
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      controls.dispose();
      dracoLoader.dispose();
      container.replaceChildren();
    };
  }, [modelChoice, heartbeatActive, activeStenosisTarget, showFlowParticles]);

  // Controls helper functions
  const handleRotate = (angleDegrees: number) => {
    if (!heartGroupRef.current) return;
    heartGroupRef.current.rotation.y += THREE.MathUtils.degToRad(angleDegrees);
  };

  const handleZoom = (factor: number) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.multiplyScalar(factor);
  };

  const handleReset = () => {
    if (cameraRef.current && controlsRef.current && heartGroupRef.current) {
      cameraRef.current.position.set(0, 0.15, 3.2);
      controlsRef.current.target.set(0, 0, 0);
      heartGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div className="three-heart-viewer-wrapper">
      {/* Top Toolbar */}
      <div className="three-toolbar">
        <div className="pill-group">
          <button
            type="button"
            className={modelChoice === "heart" ? "active" : ""}
            onClick={() => setModelChoice("heart")}
          >
            Clinical Anatomical Heart
          </button>
          <button
            type="button"
            className={modelChoice === "organ" ? "active" : ""}
            onClick={() => setModelChoice("organ")}
          >
            High-Detail Cardiac Organ
          </button>
        </div>

        <div className="toolbar-actions">
          <button
            type="button"
            className={showFlowParticles ? "active" : ""}
            onClick={() => setShowFlowParticles(!showFlowParticles)}
            title="Toggle hemodynamic blood flow animation"
          >
            {showFlowParticles ? "Flow: ON" : "Flow: OFF"}
          </button>
          <button
            type="button"
            className={showLabels ? "active" : ""}
            onClick={() => setShowLabels(!showLabels)}
            title="Toggle anatomical callout pins"
          >
            {showLabels ? "Labels: ON" : "Labels: OFF"}
          </button>
          <button
            type="button"
            className={heartbeatActive ? "active" : ""}
            onClick={() => setHeartbeatActive(!heartbeatActive)}
            title="Toggle systolic rhythm pulse"
          >
            {heartbeatActive ? "Pulse: ON" : "Pulse: OFF"}
          </button>
          <button type="button" onClick={() => handleRotate(-25)}>↺ -25°</button>
          <button type="button" onClick={() => handleRotate(25)}>↻ +25°</button>
          <button type="button" onClick={() => handleZoom(0.85)}>Zoom +</button>
          <button type="button" onClick={() => handleZoom(1.15)}>Zoom -</button>
          <button type="button" onClick={handleReset}>Reset</button>
        </div>
      </div>

      {/* Dynamic Stenosis Alert Banner in 3D Stage */}
      {activeStenosisTarget && (
        <div className="viewer-stenosis-banner">
          <div className="pulse-danger-dot" />
          <span>
            <strong>
              3D PATHOLOGY SIMULATION: {activeStenosisTarget.toUpperCase()} Stenosis (
              {stenosisSeverity}%)
            </strong>{" "}
            — Flashing ring marks lesion site; cyan particles show post-stenotic distal hypoperfusion.
          </span>
        </div>
      )}

      {/* 3D WebGL Canvas Container */}
      <div className="canvas-stage" ref={containerRef} />

      {loading && (
        <div className="viewer-overlay-message">
          <div className="spinner" />
          <span>Loading 3D Anatomical Heart...</span>
        </div>
      )}

      {loadError && (
        <div className="viewer-overlay-error">
          <span>{loadError}</span>
        </div>
      )}

      {/* Interactive 3D Callout Pins and Labels Overlay */}
      {showLabels && !loading && (
        <svg className="callout-overlay" aria-hidden="true">
          {LANDMARKS.map((lm) => {
            const coord = screenCoords[lm.id];
            if (!coord || !coord.visible) return null;

            const isSelected = lm.targetId && lm.targetId === selected;
            const isStenosed = lm.targetId && lm.targetId === activeStenosisTarget;
            const pred = lm.targetId ? predictions?.[lm.targetId] : undefined;

            const targetX = coord.x + lm.lineOffset[0];
            const targetY = coord.y + lm.lineOffset[1];
            const lineEndX = lm.align === "right" ? targetX + 140 : targetX - 140;

            const riskColor = isStenosed
              ? "#ff3838"
              : pred
              ? pred.label === "positive"
                ? "#ff4757"
                : "#2ed573"
              : isSelected
              ? "#00d2d3"
              : "#f1f2f6";

            return (
              <g
                key={lm.id}
                className={`callout-group ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  if (lm.targetId) onSelect(lm.targetId);
                }}
                style={{ cursor: lm.targetId ? "pointer" : "default" }}
              >
                <polyline
                  points={`${coord.x},${coord.y} ${targetX},${targetY} ${lineEndX},${targetY}`}
                  fill="none"
                  stroke={riskColor}
                  strokeWidth={isSelected || isStenosed ? "2.5" : "1.5"}
                  strokeDasharray={isSelected || isStenosed ? "none" : "2,2"}
                  opacity={coord.visible ? 0.85 : 0.2}
                />

                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isSelected || isStenosed ? 10 : 7}
                  fill="rgba(10, 20, 35, 0.8)"
                  stroke={riskColor}
                  strokeWidth="2"
                  className={isStenosed ? "hotspot-pulse danger" : "hotspot-pulse"}
                />

                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isSelected || isStenosed ? 4 : 3}
                  fill={riskColor}
                />

                <text
                  x={lm.align === "right" ? targetX + 4 : targetX - 4}
                  y={targetY - 6}
                  textAnchor={lm.align === "right" ? "start" : "end"}
                  fill="#ffffff"
                  fontSize={isSelected || isStenosed ? "13" : "11.5"}
                  fontWeight={isSelected || isStenosed ? "700" : "500"}
                  letterSpacing="0.3px"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {lm.name}
                  {isStenosed ? (
                    <tspan fill="#ff3838" fontWeight="bold" dx="8">
                      ⚠ CRITICAL STENOSIS ({stenosisSeverity}%)
                    </tspan>
                  ) : pred ? (
                    <tspan fill={riskColor} fontWeight="bold" dx="8">
                      {pred.label === "positive"
                        ? `▲ ${(pred.probability * 100).toFixed(0)}% High Risk`
                        : `● ${(pred.probability * 100).toFixed(0)}% Low Risk`}
                    </tspan>
                  ) : null}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {/* Bottom Floating Hint */}
      <div className="viewer-bottom-bar">
        <span>🖱 Left-drag: Orbit | 🖲 Scroll: Zoom | Red/Cyan dots: Dynamic Hemodynamic Flow Simulation</span>
        <div className="legend-tag">
          <span className="dot dot-green" /> Normal Flow
          <span className="dot dot-red" /> Stenosis Plaque
          <span className="dot dot-cyan" /> Hypoxic Distal Flow
        </div>
      </div>
    </div>
  );
}
