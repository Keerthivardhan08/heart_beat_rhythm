# CardioVision 3D: Demonstration Video Script & Walkthrough Guide
**Target Duration:** 3 to 5 minutes  
**Format:** YouTube screen recording with voiceover (or webcam inset)  
**Live URL to record:** [https://cardiovision-3d-production.up.railway.app](https://cardiovision-3d-production.up.railway.app)

---

## 🎬 Scene 1: Introduction & Problem Statement (0:00 - 0:45)

### Screen Action
- Start on the **Overview** page (`https://cardiovision-3d-production.up.railway.app`).
- Show the 3D heart beating gently on the left with the live callout pins.

### Voiceover / Talking Points
> *"Hello everyone! Welcome to our demonstration of **CardioVision 3D** for Track A: Cardiovascular Risk Visualization & Prediction.*
>
> *Coronary artery disease is the leading cause of death worldwide. While conventional statistical models output abstract risk percentages, numbers alone cannot convey to a physician or patient **where and how plaque is narrowing specific coronary arteries**.*
>
> *CardioVision 3D solves this problem by combining **multi-target machine learning inference** with an **interactive 3D WebGL anatomical hemodynamic engine**."*

---

## 🎬 Scene 2: 3D Heart Anatomy & Hemodynamic Flow (0:45 - 1:45)

### Screen Action
- Click on **"3D Heart Anatomy"** in the top navigation.
- Use the mouse to rotate the heart in 360°, zoom in, and pitch.
- Point out the parametric epicardial arteries: **Aorta, LAD, LCX, and RCA**.
- Toggle between the Preset Clinical Scenarios:
  1. Click **"Isolated LAD Stenosis (85%)"**: Show the yellow flashing plaque ring on the anterior descending artery, the slowed hypoxic cyan flow particles, and the red ischemic aura on the ventricular apex.
  2. Click **"Isolated RCA Stenosis (90%)"**: Show how the blockage moves to the right coronary artery with inferior wall hypoperfusion.
  3. Click **"Normal Patent Baseline (0%)"**: Show all plaque rings disappearing, rapid laminar red blood flow throughout all vessels, and normal rhythmic contraction.

### Voiceover / Talking Points
> *"Here in the 3D Anatomy Viewer, our WebGL engine renders a high-definition 3D heart with compressed DRACO geometry that loads in under two seconds on any standard laptop.*
>
> *Notice our real-time hemodynamic flow simulation: over 200 particle instances simulate red blood cells traveling through epicardial conduits.*
>
> *When we select the **Isolated LAD Stenosis** preset, the model pinpoints the exact site of narrowing with a pulsing yellow plaque ring. Upstream blood flows rapidly, but downstream, the particles decelerate and turn cyan to indicate tissue hypoxia, while an ischemic wireframe aura marks the distal anterior wall."*

---

## 🎬 Scene 3: Patient Assessment & AI Document OCR Extractor (1:45 - 2:45)

### Screen Action
- Navigate to **"New Analysis"**.
- Scroll to show the 52 clinical biomarkers cleanly organized into Profile, Symptoms, Vitals, ECG, Echo, and Labs.
- Scroll back up to the **"AI Medical Document & Lab OCR Extractor"** panel.
- Click the preset button: **"📄 Acute LAD Syndrome (PDF)"**.
- Show the simulated OCR scan reading blood pressure, ejection fraction, and ST elevation.
- Click **"📥 Auto-Fill 52 Form Fields With This Data"**.
- Watch all 52 inputs populate automatically!
- Click **"Run Multi-Target Risk Analysis"**.

### Voiceover / Talking Points
> *"Now let's look at the clinician input workflow in **New Analysis**. We strictly respect clinical governance: our model uses 52 non-invasive demographic, symptom, lab, ECG, and echocardiographic biomarkers, completely excluding catheterization targets to ensure zero data leakage.*
>
> *Entering 52 values manually can be tedious in emergency care. That's why we built an **AI Medical Document & Lab OCR Extractor**. Clinicians can drop in hospital PDFs, ECG scans, or lab photos.*
>
> *With one click, our extractor parses the document and auto-populates all 52 parameters. When we run the analysis, our FastAPI backend evaluates all four pipelines in milliseconds."*

---

## 🎬 Scene 4: Explainable AI (XAI) & Clinical Report (2:45 - 3:30)

### Screen Action
- Show the results card: CAD risk probability, vessel breakdown (LAD, LCX, RCA).
- Scroll down to the **Feature Attribution (Explainability)** chart.
- Hover over the positive (red) and negative (green) log-odds waterfall bars.
- Click **"📄 View / Print Full Clinical Report"**.
- Display the clean, printable clinical summary modal with ECG, Echo, laboratory markers, and institutional disclaimer.

### Voiceover / Talking Points
> *"Because clinical safety requires transparency, we provide full Explainable AI. Rather than a black box, CardioVision 3D displays log-odds feature attributions. For this patient, we can immediately see that regional wall motion abnormalities, severe ejection fraction reduction to 35%, and ST elevation are the primary drivers elevating anterior LAD occlusion risk.*
>
> *Clinicians can also generate a hospital-grade printable PDF report for the electronic health record."*

---

## 🎬 Scene 5: Admin Records Vault & Permanent Deployment (3:30 - 4:15)

### Screen Action
- Navigate to **"Patient Records (Admin)"**.
- Show the searchable patient registry. Filter by "High Risk".
- Click **"👁️ Load into 3D Viewer"** on any record to show that it immediately syncs into the 3D heart.
- Click **"📥 Export Database to CSV"** to demonstrate data portability.
- Briefly show the Swagger API documentation at `/docs` in another tab to prove clean architecture.

### Voiceover / Talking Points
> *"Finally, in the **Patient Records Vault**, all patient cases are archived with multi-vessel risk matrices. Administrators can search, filter by risk tier, export the registry to CSV, or load any patient directly back into the 3D heart with one click.*
>
> *CardioVision 3D is fully containerized and **permanently deployed on Railway with full HTTPS and public Swagger API documentation**.*
>
> *Thank you for your time, and we look forward to your feedback!"*
