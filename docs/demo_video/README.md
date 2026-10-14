# CardioVision 3D: Demo Walkthrough Video

This directory contains the automated Full HD (1920x1080) walkthrough video demonstrating the entire system for the hackathon submission.

### Available Video Files:
1. **`cardiovision3d_demo_walkthrough.mp4`** (1080p, 54 MB, 1,770 frames) - Standard MP4 format ready to upload directly to YouTube, LinkedIn, or hackathon portals.
2. **`cardiovision3d_demo_walkthrough.webm`** (1080p, 31.7 MB) - High-efficiency WebM format playable in all modern browsers.

### Captured Features Demonstrated:
- **Scene 1 (0:00 - 0:10)**: Clinical Landing & 3D Heart Overview with live callout pins.
- **Scene 2 (0:10 - 0:30)**: Interactive 360° heart rotation, hemodynamic blood flow particles, and 4 clinical scenarios:
  - Isolated LAD Stenosis (85%) with pulsing plaque ring & hypoxic cyan flow
  - Isolated RCA Stenosis (90%) with inferior wall ischemia
  - Triple-Vessel CAD (95%) with diffuse lesions
  - Normal Patent Baseline (0%) with laminar flow reserve
- **Scene 3 (0:30 - 0:50)**: AI Medical Document & Lab OCR Extractor:
  - Drag-and-drop parsing of clinical report
  - 1-click auto-fill of 52 clinical biomarker inputs
  - Multi-target ML prediction execution with probability radar and feature attribution waterfall chart
- **Scene 4 (0:50 - 1:00)**: Hospital-grade printable clinical decision report modal.
- **Scene 5 (1:00 - 1:10)**: Patient Records (Admin Vault) search, filtering, and 1-click load into the 3D heart viewer.
- **Scene 6 (1:10 - 1:15)**: Model Quality & 5-Fold cross-validation audit suite.

### How to Re-generate:
```bash
python scripts/record_demo_video.py
```
