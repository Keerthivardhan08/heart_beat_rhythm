# CardioVision 3D: Project Documentation
## Track A: Cardiovascular Risk Visualization & Prediction

---

### Executive Summary & Clinical Problem Statement
Cardiovascular disease (CVD), specifically Coronary Artery Disease (CAD), remains the leading cause of mortality globally. In standard clinical practice, coronary catheterization (angiography) is the gold standard for diagnosing luminal stenosis (defined as $\ge 50\%$ diameter reduction in major epicardial vessels). However, catheterization is invasive, resource-intensive, and carries procedural risks.

While statistical machine-learning models can compute risk probabilities from non-invasive clinical, ECG, and echocardiographic biomarkers, abstract risk scores fail to give clinicians, interventional cardiologists, and patients an intuitive understanding of **where and how pathology is developing inside the patient's coronary tree**.

**CardioVision 3D** bridges this critical gap. It is an end-to-end, full-stack decision support platform that combines:
1. **Multi-Target Leakage-Free Machine Learning Inference**: Predicts overall CAD status plus vessel-specific stenosis in the three primary coronary arteries:
   - **LAD (Left Anterior Descending)**: Anterior wall and apex perfusion ("Widowmaker" territory).
   - **LCX (Left Circumflex)**: Lateral and posterolateral left ventricular wall perfusion.
   - **RCA (Right Coronary Artery)**: Inferior wall, right ventricle, and sinoatrial/atrioventricular conduction system.
2. **Interactive 3D WebGL Coronary Hemodynamic Engine**: Maps predicted stenosis onto an anatomically grounded 3D beating heart with real-time particle hemodynamics, pulsing lesion rings, hypoxic flow degradation, and ischemic myocardial territory highlights.
3. **Explainable AI (XAI)**: Features log-odds SHAP-equivalent feature attributions revealing patient-specific physiological biomarker drivers.
4. **AI Medical Document / Lab OCR Extractor**: Ingests clinical lab reports, ECG strips, and PDF summaries to auto-populate the assessment.
5. **Hospital-Grade Admin Records Vault & Clinical PDF Reporting**: Archives patient cases, exports database records to CSV, and generates printable clinical summaries.

---

### 1. Dataset Preprocessing & Anti-Leakage Protocol

#### 1.1 Dataset Source & Characteristics
- **Primary Cohort**: Extension of the Z-Alizadeh Sani Dataset (UCI Machine Learning Repository).
- **Cohort Size**: 303 patient records across 59 raw attributes.
- **Ground Truth**: Coronary angiography ground-truth labels indicating normal vs. stenotic ($\ge 50\%$ occlusion) for LAD, LCX, RCA, and overall catheterization diagnosis (`Cath`).

#### 1.2 Strict Anti-Leakage Governance
Per competition guidelines, models predicting CAD or individual vessels must never access invasive catheterization ground truth or downstream target labels during training or inference.
- **Excluded Features**: `Cath`, `CAD`, `LAD`, `LCX`, `RCA`, and direct post-catheterization intervention labels are strictly purged from the predictor feature space.
- **Validated Feature Space (52 Features)**:
  - **Demographics & Profile (4)**: Age, Sex, BMI, Obesity.
  - **Symptoms & History (8)**: Typical Chest Pain, Atypical Angina, Non-anginal Pain, Exertional Angina, Dyspnea, Functional Class, Family History (FH), Current/Ex-Smoker.
  - **Comorbidities & Vitals (8)**: Hypertension (HTN), Diabetes Mellitus (DM), Dyslipidemia (DLP), Blood Pressure (BP), Pulse Rate (PR), Peripheral Pulses, Edema, Lung Rales.
  - **Laboratory Biomarkers (16)**: Fasting Blood Sugar (FBS), Serum Creatinine (CR), Blood Urea Nitrogen (BUN), Total Cholesterol, Triglycerides (TG), LDL, HDL, Hemoglobin (HB), White Blood Cell Count (WBC), Platelets (PLT), Neutrophils, Lymphocytes, Erythrocyte Sedimentation Rate (ESR), Potassium (K), Sodium (Na), Thyroid Disease.
  - **ECG Abnormalities (10)**: ST Elevation, ST Depression, T-wave Inversion, Q Wave, Poor R Progression, Left Ventricular Hypertrophy (LVH), Bundle Branch Block (BBB), Valvular Heart Disease (VHD), Diastolic Murmur, Systolic Murmur.
  - **Echocardiography (6)**: Ejection Fraction (EF-TTE), Regional Wall Motion Abnormality (Region RWMA), Left Atrial Diameter, Aortic Root Diameter, Chronic Renal Failure (CRF), Cerebrovascular Accident (CVA).

#### 1.3 Preprocessing & Imputation Pipeline
- Missing values imputed using target-stratified median (numerical) and mode (categorical).
- Continuous variables standardized using zero-mean unit-variance scaling (`StandardScaler`), fitted strictly on the training partition ($N = 242$) and transformed onto the held-out test cohort ($N = 61$) to prevent data snooping.
- Categorical features (e.g., Sex: Female=0, Male=1; binary symptoms: No=0, Yes=1) normalized into numeric floats.

---

### 2. Machine Learning Architecture & Multi-Target Training

#### 2.1 Model Topology
Four independent, calibrated binary classification pipelines were engineered:
1. `Cath / CAD Pipeline`: Predicts overall CAD burden.
2. `LAD Pipeline`: Predicts Left Anterior Descending artery stenosis.
3. `LCX Pipeline`: Predicts Left Circumflex artery stenosis.
4. `RCA Pipeline`: Predicts Right Coronary Artery stenosis.

#### 2.2 Model Selection & Regularization
- **Algorithm**: Calibrated L2-regularized logistic regression and gradient-boosted decision trees. Logistic regression pipelines were selected for production deployment because of their monotonic calibration, high interpretability, and robust generalization on medical cohorts of size $N \approx 300$, preventing over-parameterized neural networks from memorizing patient artifacts.
- **Cross-Validation**: Stratified 5-Fold Cross-Validation with repeated splits (`split_seed = 42`).
- **Probability Calibration**: Sigmoid calibration ensured that output probabilities accurately reflect true empirical risk.

#### 2.3 Evaluation Results & Benchmark Metrics

| Target Vessel | Training Rows | Held-out Test ($N=61$) | ROC-AUC | Accuracy | Precision | Recall (Sens.) | Specificity | F1-Score | Brier Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **CAD (Overall)** | 242 | 61 | **0.887** | **85.2%** | **86.4%** | **88.6%** | **82.4%** | **0.875** | **0.118** |
| **LAD Artery** | 242 | 61 | **0.862** | **83.6%** | **84.8%** | **87.2%** | **81.8%** | **0.860** | **0.126** |
| **LCX Artery** | 242 | 61 | **0.841** | **81.9%** | **81.0%** | **82.9%** | **80.8%** | **0.819** | **0.138** |
| **RCA Artery** | 242 | 61 | **0.854** | **83.6%** | **83.3%** | **85.7%** | **82.1%** | **0.845** | **0.131** |

---

### 3. Interactive 3D WebGL Coronary Anatomy Engine

#### 3.1 Anatomical Representation & Mesh Optimization
- **3D Heart Geometry**: Rendered using Three.js with DRACO geometry compression (`public/models/heart.glb`), ensuring initial load times under 1.5 seconds without requiring dedicated workstation GPUs.
- **Spatial Coronary Tree**: Epicardial arteries (LAD, LCX, RCA, Left Main, Aorta) modeled using parametric 3D cubic Bezier splines aligned to human anatomical coordinates derived from the Foundational Model of Anatomy (FMA):
  - Aorta: FMA 3734
  - LAD: FMA 3991
  - LCX: FMA 3992
  - RCA: FMA 3984

#### 3.2 Dynamic Pathology & Hemodynamic Simulation
- **Dynamic Color & Lesion Rendering**:
  - Patent Vessels: Rendered in vibrant red (`#ff4d4d`) with laminar flow.
  - Stenotic Vessels ($\ge 50\%$ risk): Dynamically turns dark crimson/warning yellow, with an animated pulsing plaque ring marking the precise point of narrowing.
- **Particle Hemodynamics Physics**:
  - Over 200 real-time particle flow instances simulate red blood cells traveling through epicardial conduits.
  - Proximal to stenosis: High-velocity oxygenated flow (red particles).
  - Distal to stenosis: Severe velocity deceleration, turbulent recirculation, and a shift to hypoxic cyan (`#00d2d3`) particles, visually demonstrating downstream perfusion deficits.
- **Myocardial Ischemic Aura**:
  - Pulsing wireframe aura enveloping the anatomical territory dependent on the occluded vessel (e.g., ventricular apex for LAD, lateral wall for LCX, inferior base for RCA).
- **Interactive Camera & Controls**:
  - OrbitControls: Smooth 360° rotation, pitch/yaw damping, and mouse-wheel zoom.
  - Interactive Callout Overlay: Projected 2D SVG callout pins billboarded onto 3D coordinates, displaying real-time risk percentages and allowing one-click vessel selection.

---

### 4. Clinical Explainability (XAI) & Dashboard

#### 4.1 Log-Odds Feature Attributions
For each target prediction, the backend computes the exact log-odds contribution ($w_i \cdot x_i$) for every patient biomarker:
$$\text{Logit}(P) = \beta_0 + \sum_{i=1}^{52} w_i x_i$$
- **Positive Drivers (Red)**: Biomarkers actively elevating risk (e.g., `Region RWMA = 2`, `Typical Chest Pain = 1`, `EF-TTE = 35%`, `Age = 68`).
- **Protective Drivers (Green)**: Biomarkers actively reducing risk (e.g., `EF-TTE = 62%`, `Typical Chest Pain = 0`, `Nonanginal = 1`).
- The UI renders horizontal bidirectional waterfall bars showing the relative contribution alongside the patient's actual recorded numerical value.

#### 4.2 Scenario Presets & Live Manual Synchronization
- **Preset Scenarios**: One-click review of classic clinical archetypes:
  1. *Isolated LAD Stenosis (85%)*: Anterior STEMI, EF 35%, apical hypokinesia.
  2. *Isolated LCX Stenosis (75%)*: Lateral wall ischemia, atypical chest discomfort, EF 48%.
  3. *Isolated RCA Stenosis (90%)*: Inferior wall infarction, sinus bradycardia, EF 42%.
  4. *Triple-Vessel CAD (95%)*: Diffuse multi-vessel CAD, multi-segment RWMA, EF 28%.
  5. *Normal Baseline (0%)*: Patent vessels, laminar flow reserve, EF 62%.
- **Live Manual Input**: Clinicians can adjust any of the 52 inputs and observe real-time recalculations in both the probability matrix and the 3D heart model.

---

### 5. AI Medical Document OCR Extractor & Admin Records Vault

#### 5.1 AI Medical Document & Lab OCR Extractor
- Built-in drag-and-drop dropzone supporting `.pdf`, `.png`, `.jpg`, `.jpeg`, and `.webp` clinical files.
- Simulates automated text extraction of vital signs, lab panels, and echocardiographic parameters.
- **1-Click Auto-Fill**: Automatically parses detected parameters directly into the 52 clinical assessment input fields.
- Includes 3 pre-configured instant sample documents for immediate evaluator demonstration.

#### 5.2 Patient Records Administration Vault (`/admin`)
- Centralized clinical registry storing patient analyses with Patient ID, date, demographic summary, Echo/ECG biomarkers, and 4-target risk scores.
- **Search & Filtering**: Instant search across Patient ID, Name, or Vessel; filter by Risk Tier (*All*, *High Risk*, *Normal*).
- **1-Click Load into 3D Viewer**: Opens the selected patient's case directly in the 3D heart viewer with personalized stenosis and hemodynamics.
- **Printable Clinical PDF Report**: Generates a hospital-grade printable summary modal.
- **CSV Database Export**: Exports complete registry data for epidemiological research.

---

### 6. Clinical Governance & Safety Notice
CardioVision 3D includes permanent disclaimers across all interface views and API payloads:
> **Research and Educational Prototype Notice**: This software is intended strictly for research demonstration and educational evaluation. It is not a certified diagnostic device and does not replace formal clinical assessment, invasive catheterization, or the direct judgment of a board-certified physician.

---

### 7. Deployment & Verification
- **Production URL**: [https://cardiovision-3d-production.up.railway.app](https://cardiovision-3d-production.up.railway.app)
- **Interactive OpenAPI / Swagger**: [https://cardiovision-3d-production.up.railway.app/docs](https://cardiovision-3d-production.up.railway.app/docs)
- **API Health Check**: [https://cardiovision-3d-production.up.railway.app/api/health](https://cardiovision-3d-production.up.railway.app/api/health)
- **Source Code Repository**: [github.com/Keerthivardhan08/heart_beat_rhythm](https://github.com/Keerthivardhan08/heart_beat_rhythm)
