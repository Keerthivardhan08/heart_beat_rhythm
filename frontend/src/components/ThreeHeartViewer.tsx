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
}

export function ThreeHeartViewer({
  predictions,
  selected,
  onSelect,
}: ThreeHeartViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [heartbeatActive, setHeartbeatActive] = useState(true);
  const [modelChoice, setModelChoice] = useState<"heart" | "organ">("heart");

  // Track projected 2D screen coordinates of each landmark
  const [screenCoords, setScreenCoords] = useState<
    Record<string, { x: number; y: number; visible: boolean }>
  >({});

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const heartGroupRef = useRef<THREE.Group | null>(null);

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

    // 6. Heart Group
    const heartGroup = new THREE.Group();
    scene.add(heartGroup);
    heartGroupRef.current = heartGroup;

    // Load Model with local DRACO decompression
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    loader.setDRACOLoader(dracoLoader);

    const modelPath = modelChoice === "heart" ? "/models/heart.glb" : "/models/heart-organ.glb";

    // Helper: Mount and perfectly center any model
    const mountModel = (root: THREE.Object3D) => {
      heartGroup.clear();

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
      wrapper.add(root);

      // Shift root inside wrapper so its center is (0, 0, 0)
      root.position.set(-center.x, -center.y, -center.z);

      // Scale the wrapper uniformly
      wrapper.scale.setScalar(targetScale);

      heartGroup.add(wrapper);
      setLoading(false);
      setLoadError(null);
    };

    // Fallback: Procedural Anatomical Heart Mesh if GLB fails
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

      // Coronary Arteries (LAD, LCX, RCA tubes)
      const ladCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.08, 0.22, 0.35),
        new THREE.Vector3(0.16, 0.02, 0.44),
        new THREE.Vector3(0.22, -0.22, 0.48),
        new THREE.Vector3(0.24, -0.52, 0.42),
      ]);
      const ladGeo = new THREE.TubeGeometry(ladCurve, 24, 0.028, 8, false);
      const arteryMat = new THREE.MeshStandardMaterial({
        color: 0xff3b30,
        roughness: 0.25,
        metalness: 0.2,
      });
      proceduralGroup.add(new THREE.Mesh(ladGeo, arteryMat));

      mountModel(proceduralGroup);
    };

    loader.load(
      modelPath,
      (gltf) => {
        mountModel(gltf.scene);
      },
      undefined,
      (err) => {
        console.warn(`Error loading primary model ${modelPath}, trying alternate:`, err);
        const fallbackPath = modelPath === "/models/heart.glb" ? "/models/heart-organ.glb" : "/models/heart.glb";
        loader.load(
          fallbackPath,
          (gltfFallback) => {
            mountModel(gltfFallback.scene);
          },
          undefined,
          (err2) => {
            console.error("Both GLB models failed, activating procedural anatomical heart:", err2);
            createProceduralHeart();
          }
        );
      }
    );

    // 7. Render Loop & Landmark Projection
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle heartbeat pulse
      if (heartbeatActive && heartGroup) {
        const pulse = 1 + Math.sin(elapsed * 4.2) * 0.022;
        heartGroup.scale.set(pulse, pulse, pulse);
      }

      controls.update();
      renderer.render(scene, camera);

      // Project 3D landmarks to 2D screen positions
      const newCoords: Record<string, { x: number; y: number; visible: boolean }> = {};
      const tempVec = new THREE.Vector3();

      LANDMARKS.forEach((lm) => {
        tempVec.set(...lm.position);
        tempVec.applyMatrix4(heartGroup.matrixWorld);

        // Check if facing camera
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

    // 8. Handle Resize
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
  }, [modelChoice, heartbeatActive]);

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
            const pred = lm.targetId ? predictions?.[lm.targetId] : undefined;

            const targetX = coord.x + lm.lineOffset[0];
            const targetY = coord.y + lm.lineOffset[1];
            const lineEndX = lm.align === "right" ? targetX + 140 : targetX - 140;

            // Risk color coding
            const riskColor = pred
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
                {/* SVG Pointer Connector Line */}
                <polyline
                  points={`${coord.x},${coord.y} ${targetX},${targetY} ${lineEndX},${targetY}`}
                  fill="none"
                  stroke={riskColor}
                  strokeWidth={isSelected ? "2.5" : "1.5"}
                  strokeDasharray={isSelected ? "none" : "2,2"}
                  opacity={coord.visible ? 0.85 : 0.2}
                />

                {/* Hotspot Outer Halo Ring */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isSelected ? 10 : 7}
                  fill="rgba(10, 20, 35, 0.8)"
                  stroke={riskColor}
                  strokeWidth="2"
                  className="hotspot-pulse"
                />

                {/* Hotspot Center Dot */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isSelected ? 4 : 3}
                  fill={riskColor}
                />

                {/* Landmark Underlined Text Label */}
                <text
                  x={lm.align === "right" ? targetX + 4 : targetX - 4}
                  y={targetY - 6}
                  textAnchor={lm.align === "right" ? "start" : "end"}
                  fill="#ffffff"
                  fontSize={isSelected ? "13" : "11.5"}
                  fontWeight={isSelected ? "700" : "500"}
                  letterSpacing="0.3px"
                  fontFamily="system-ui, -apple-system, sans-serif"
                >
                  {lm.name}
                  {pred && (
                    <tspan
                      fill={riskColor}
                      fontWeight="bold"
                      dx="8"
                    >
                      {pred.label === "positive"
                        ? `▲ ${(pred.probability * 100).toFixed(0)}% High Risk`
                        : `● ${(pred.probability * 100).toFixed(0)}% Low Risk`}
                    </tspan>
                  )}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      {/* Bottom Floating Hint */}
      <div className="viewer-bottom-bar">
        <span>🖱 Left-drag: Orbit/Rotate | 🖲 Scroll: Zoom | ⇥ Click pin or vessel to inspect</span>
        <div className="legend-tag">
          <span className="dot dot-green" /> Low Risk
          <span className="dot dot-red" /> Elevated Risk
          <span className="dot dot-cyan" /> Selected Vessel
        </div>
      </div>
    </div>
  );
}
