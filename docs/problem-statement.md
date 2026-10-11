
# Problem statement

CardioVision 3D is a research/education prototype that explores how machine-learning outputs for coronary artery disease (CAD) and artery-related dataset labels can be presented with explainability, evaluation evidence, and an interactive anatomical viewer.

The system has four parts:
1. Data validation and leakage-safe ML.
2. Prediction and evaluation for CAD, LAD, LCX, and RCA targets, after verifying the dataset's exact label meanings.
3. A 3D viewer that helps users explore coronary anatomy.
4. A web application for inputs, results, explanations, evaluation metrics, and research reports.

## Important boundaries

- The dataset's columns and label definitions must be verified before modeling.
- The model must not use target labels or answer-revealing diagnostic features as predictors.
- Tabular labels alone do not identify patient-specific 3D lesion coordinates.
- Do not claim clinical validation or use this prototype to guide patient care.
