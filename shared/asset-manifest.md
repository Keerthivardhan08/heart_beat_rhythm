# 3D Asset Manifest

Status: **CONFIGURED & ACTIVE**

The 3D anatomy viewer integrates interactive 3D WebGL anatomical assets with projected clinical landmark pins (Aorta, Left Main Coronary Artery, LAD, LCX, RCA, Right Ventricle, Left Ventricle).

## Active 3D Assets

1. **`frontend/public/models/heart.glb`** (Primary Asset)
   - **Source**: 3D Human Heart Anatomical Model (Sketchfab / Open-Access Medical Project)
   - **File format**: GLTF Binary (`.glb`), 3.76 MB
   - **License**: Creative Commons Attribution (CC-BY 4.0)
   - **Rendering**: Three.js WebGL Renderer with OrbitControls, directional studio key/fill/rim lighting, and real-time screen projection of 3D anatomical pins.
   - **Anatomical coverage**: Full external cardiac anatomy, ascending aorta and aortic arch, pulmonary trunk, right atrium, right ventricle, left ventricle, anterior interventricular groove, and coronary branching network.

2. **`frontend/public/models/heart-organ.glb`** (High-Detail Cardiac Organ Option)
   - **Source**: Human-Organ3D Open Library
   - **File format**: GLTF Binary (`.glb`), 7.55 MB
   - **License**: MIT / CC-BY
   - **Usage**: High-resolution alternate view selectable via the top viewer toolbar.

## Verified Landmark & Target Mappings

| Landmark ID | Target ID | Anatomical Label | Perfusion Territory |
|:---|:---|:---|:---|
| `aorta` | — | Aorta (Arch & Root) | Origin of systemic arterial circulation |
| `lmca` | — | Left main coronary artery | Origin of left coronary circulation |
| `lad` | `lad` | Left anterior descending artery (LAD) | Interventricular septum, anterior LV wall, cardiac apex |
| `lcx` | `lcx` | Left circumflex artery (LCX) | Posterolateral LV wall, obtuse marginal branches |
| `rca` | `rca` | Right coronary artery (RCA) | Right ventricle, inferior diaphragmatic LV wall |
| `rv` | — | Right ventricle | Pulmonary circulation pump |
| `lv` | — | Left ventricle | Systemic circulation pump |

## Clinical Boundary & Safety Guardrail

- The 3D model provides anatomical orientation and spatial reference for tabular classification results.
- Model probabilities indicate tabular statistical risk of significant stenosis ($\ge 50\%$) derived from non-invasive clinical predictors; they do **not** represent patient-specific lesion geometry, lumen narrowing millimeters, or physical intravascular imaging.
