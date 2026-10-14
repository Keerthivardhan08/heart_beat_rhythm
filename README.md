# CardioVision 3D (Heart Beat Rhythm) 🫀

[![Live Production](https://img.shields.io/badge/Live%20Demo-cardiovision--3d.up.railway.app-success?style=for-the-badge&logo=railway)](https://cardiovision-3d-production.up.railway.app)
[![API Docs](https://img.shields.io/badge/API%20Docs-Swagger%20%2F%20OpenAPI-blue?style=for-the-badge&logo=fastapi)](https://cardiovision-3d-production.up.railway.app/docs)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

### 🌐 Live Permanent Deployment
* **Live Web Application**: [https://cardiovision-3d-production.up.railway.app](https://cardiovision-3d-production.up.railway.app)
* **Interactive API Documentation**: [https://cardiovision-3d-production.up.railway.app/docs](https://cardiovision-3d-production.up.railway.app/docs)
* **API Health Check**: [https://cardiovision-3d-production.up.railway.app/api/health](https://cardiovision-3d-production.up.railway.app/api/health)

**CardioVision 3D** is an explainable cardiovascular machine-learning decision support and 3D anatomical visualization system. It combines multi-target predictive modeling (`CAD`, `LAD`, `LCX`, `RCA`), an interactive WebGL coronary anatomy viewer with live hemodynamic flow simulation, clinical explainability (log-odds feature drivers), an AI medical document/lab OCR extractor, and a patient records administration vault.

> **Research and Educational Prototype Notice:** This software is developed for research demonstration and educational evaluation. It is not a certified medical device and must not be used as a substitute for professional clinical judgment, invasive catheterization, or diagnostic prescriptions.

---

## 🚀 Key Highlights & Capabilities

### 1. Multi-Target Machine Learning Inference
* **4 Calibrated Pipelines**: Predicts overall CAD burden as well as vessel-specific stenosis probabilities:
  * **CAD**: Overall coronary artery disease likelihood (Catheterization ground-truth).
  * **LAD**: Left Anterior Descending ("Widowmaker") artery occlusion risk.
  * **LCX**: Left Circumflex artery occlusion risk.
  * **RCA**: Right Coronary Artery occlusion risk.
* **Leakage-Free Protocol**: Strict omission of invasive catheterization targets from the predictor feature space (52 verified clinical features: demographics, symptom presentation, labs, and ECG/echocardiographic markers).

### 2. Interactive 3D WebGL Coronary Anatomy & Pathology Engine
* **High-Detail 3D Heart Geometry**: Rendered with Three.js WebGL and DRACO decompression.
* **Dynamic Pathology & Stenosis Simulation**:
  * ⚡ **Pulsing Plaque Rings**: Pinpoints the exact anatomical site of stenosis along the vessel.
  * 🩸 **Hemodynamic Particle Stream**: Simulates real-time red blood cell flow (rapid red oxygenated flow vs. post-stenotic slowed cyan/hypoxic flow).
  * 🌐 **Ischemic Myocardial Auras**: Pulsing wireframe highlight showing the distal myocardial territory suffering from perfusion deficits.
* **OrbitControls**: 360° rotation, tilt, smooth zoom, systolic pulse toggling, and projected 2D anatomical callout pins.

### 3. Clinical Scenario Presets
One-click inspection for judges and clinicians:
* **Isolated LAD Stenosis (85%)**: Crushing chest pain, anterior wall hypokinesia, V1–V4 ST elevation (EF: 35%).
* **Isolated LCX Stenosis (75%)**: Atypical radiating angina, lateral ischemia (EF: 48%).
* **Isolated RCA Stenosis (90%)**: Diaphoresis, sinus bradycardia, inferior wall akinesia (EF: 42%).
* **Triple-Vessel CAD (95%)**: Diffuse multi-vessel atherosclerosis, global LV remodeling (EF: 28%).
* **Normal Patent Baseline (0%)**: Healthy epicardial vessels with full laminar reserve (EF: 62%).

### 4. BodyParts3D (DBCLS) FMA Ontology Integration
* Dedicated page mapping the Foundational Model of Anatomy (FMA):
  * Aorta (FMA 3734)
  * Left Anterior Descending (FMA 3991)
  * Left Circumflex (FMA 3992)
  * Right Coronary (FMA 3984)
  * Ventricles (FMA 7096 / 7097)
  * Pulmonary Trunk (FMA 8612)
* Interactive layer toggles and architectural comparison between BodyParts3D, NIH 3D Print Exchange, and CardioVision 3D WebGL.

### 5. Model Quality & Audit Dashboard
* **Independent Evaluation Suite**:
  * Stratified 5-fold cross-validation & held-out test cohort ($N = 61$).
  * Metrics across all 4 targets: ROC-AUC ($0.84 - 0.89$), Sensitivity ($82\% - 91\%$), Specificity ($84\% - 86\%$), Brier Calibration Score ($0.11 - 0.14$).
  * Interactive Confusion Matrix (TP, FP, FN, TN) and decision threshold sensitivity simulator ($0.20$ to $0.80$).

### 6. Hospital-Grade Printable Clinical Report / PDF
* Formatted printable summary for patient records (`window.print()` / PDF export).
* Includes patient profile, multi-vessel risk matrix, primary biomarker drivers, clinical next steps, and institutional governance disclaimer.

---

## 🛠 Tech Stack

* **Frontend**: React 18, TypeScript, Vite, Three.js, OrbitControls, DRACOLoader.
* **Backend**: FastAPI, Uvicorn, Pydantic, Scikit-Learn 1.8.0, Joblib, Pandas, NumPy.
* **3D Assets**: Anatomical cardiac organ meshes, Catmull-Rom parametric coronary rigs, procedural fallback geometries.
* **Data**: Z-Alizadeh Sani Cardiovascular Catheterization Registry ($N = 303$ patients, 59 attributes).

---

## ⚡ Quickstart Guide

### 1. Clone & Setup Repository
```bash
git clone https://github.com/Keerthivardhan08/heart_beat_rhythm.git
cd heart_beat_rhythm
```

### 2. Start Backend API Server
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\Activate.ps1
# Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 3. Start Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
* Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Team Ownership & Architecture

| Module | Directory | Description |
|---|---|---|
| **Machine Learning** | `ml folder/` | Pipeline serialization, scikit-learn models, training splits, metadata |
| **Backend API** | `backend/` | FastAPI routes, input normalization, feature explanation engine |
| **3D Visualization** | `frontend/src/components/ThreeHeartViewer.tsx` | WebGL scene, particle physics, stenosis rings, ischemic auras |
| **Frontend App** | `frontend/src/` | Interactive forms, Model Quality suite, BodyParts3D explorer, Report modal |
| **Shared Contracts** | `shared/` | Shared feature manifest, prediction schema, mock payloads |

---

## ⚖️ Governance & Safety Protocol

1. **Non-Diagnostic Claim**: All UI surfaces state that outputs are statistical approximations and do not constitute physical lesion geometries.
2. **Universal Robustness**: Missing inputs are defaulted safely; categorical fields (like Biological Sex `Male`/`Female` and `Yes`/`No` strings) are normalized seamlessly.
3. **Reproducibility**: Trained pipelines and test splits are frozen with deterministic seeds.
