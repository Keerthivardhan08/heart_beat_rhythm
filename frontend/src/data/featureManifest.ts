export type FeatureType = "number" | "binary";

export interface FeatureOption {
  value: number;
  label: string;
}

export interface FeatureDefinition {
  name: string;
  label?: string;
  type: FeatureType;
  group: "Profile" | "History" | "Symptoms" | "Labs" | "ECG / Echo";
  defaultValue: number;
  unit?: string;
  description?: string;
  options?: FeatureOption[];
}

const sexFeature = (): FeatureDefinition => ({
  name: "Sex",
  label: "Biological Sex",
  type: "binary",
  group: "Profile",
  defaultValue: 1,
  description: "Patient biological sex",
  options: [
    { value: 1, label: "Male" },
    { value: 0, label: "Female" },
  ],
});

const binary = (
  name: string,
  group: FeatureDefinition["group"],
  defaultValue = 0,
  label?: string,
  description?: string
): FeatureDefinition => ({
  name,
  label: label ?? name,
  type: "binary",
  group,
  defaultValue,
  description,
  options: [
    { value: 0, label: "No" },
    { value: 1, label: "Yes" },
  ],
});

const number = (
  name: string,
  group: FeatureDefinition["group"],
  defaultValue: number,
  label?: string,
  unit?: string,
  description?: string
): FeatureDefinition => ({
  name,
  label: label ?? name,
  type: "number",
  group,
  defaultValue,
  unit,
  description,
});

export const featureManifest: FeatureDefinition[] = [
  // Profile
  number("Age", "Profile", 58, "Patient Age", "years", "Chronological age in completed years"),
  sexFeature(),
  number("BMI", "Profile", 27, "Body Mass Index (BMI)", "kg/m²", "Weight (kg) / Height² (m²)"),
  number("BP", "Profile", 130, "Blood Pressure (Systolic BP)", "mmHg", "Resting systolic arterial pressure"),
  number("PR", "Profile", 76, "Pulse / Heart Rate (PR)", "bpm", "Resting radial heart rate"),

  // History
  binary("DM", "History", 0, "Diabetes Mellitus (DM)", "History or clinical diagnosis of diabetes"),
  binary("HTN", "History", 1, "Hypertension (HTN)", "History of elevated arterial hypertension"),
  binary("Current Smoker", "History", 0, "Current Active Smoker", "Active cigarette smoking within last 12 months"),
  binary("EX-Smoker", "History", 0, "Former / Ex-Smoker", "Previous history of smoking with cessation"),
  binary("FH", "History", 0, "Family History (FH) of CAD", "Documented premature CAD in first-degree relatives"),
  binary("Obesity", "History", 0, "Clinical Obesity", "BMI >= 30 kg/m² or clinical diagnosis"),
  binary("CRF", "History", 0, "Chronic Renal Failure (CRF)", "Chronic kidney dysfunction or eGFR < 60"),
  binary("CVA", "History", 0, "Cerebrovascular Accident (CVA / Stroke)", "History of ischemic or hemorrhagic stroke / TIA"),
  binary("Airway disease", "History", 0, "Chronic Airway Disease (COPD/Asthma)", "Documented obstructive airway pathology"),
  binary("Thyroid Disease", "History", 0, "Thyroid Dysfunction", "Hypo/hyperthyroidism history"),
  binary("CHF", "History", 0, "Congestive Heart Failure (CHF)", "History of decompensated cardiac failure"),
  binary("DLP", "History", 1, "Dyslipidemia (DLP)", "Hypercholesterolemia or lipid-lowering therapy"),

  // Symptoms
  binary("Typical Chest Pain", "Symptoms", 1, "Typical Anginal Chest Pain", "Substernal pressure precipitated by exertion & relieved by rest/NTG"),
  binary("Atypical", "Symptoms", 0, "Atypical Angina", "Meets 2 of 3 classical angina criteria"),
  binary("Nonanginal", "Symptoms", 0, "Non-Anginal Chest Pain", "Meets 1 or 0 classical angina criteria"),
  binary("LowTH Ang", "Symptoms", 0, "Low-Threshold Angina", "Angina triggered by minimal physical exertion"),
  binary("Dyspnea", "Symptoms", 1, "Exertional Dyspnea (Shortness of Breath)", "Shortness of breath upon routine physical activity"),
  number("Function Class", "Symptoms", 2, "NYHA Functional Class", "Class 1-4", "New York Heart Association exertion class (1 to 4)"),
  binary("Edema", "Symptoms", 0, "Peripheral Lower-Limb Edema", "Pitting ankle or pretibial fluid accumulation"),
  binary("Weak Peripheral Pulse", "Symptoms", 0, "Weak Peripheral Pulses", "Diminished or absent pedal/tibial pulses"),
  binary("Lung rales", "Symptoms", 0, "Pulmonary Lung Rales / Crackles", "Auscultatory bibasilar inspiratory crackles"),
  binary("Systolic Murmur", "Symptoms", 0, "Cardiac Systolic Murmur", "Pathological ejection or pansystolic murmur"),
  binary("Diastolic Murmur", "Symptoms", 0, "Cardiac Diastolic Murmur", "Pathological aortic/mitral diastolic murmur"),

  // Labs
  number("FBS", "Labs", 105, "Fasting Blood Sugar (FBS)", "mg/dL", "Normal fasting glucose: 70-99 mg/dL"),
  number("CR", "Labs", 1.0, "Serum Creatinine (CR)", "mg/dL", "Renal function marker; normal: 0.6-1.2 mg/dL"),
  number("TG", "Labs", 150, "Serum Triglycerides (TG)", "mg/dL", "Normal: <150 mg/dL"),
  number("LDL", "Labs", 110, "Low-Density Lipoprotein (LDL)", "mg/dL", "Atherogenic lipoprotein; optimal: <100 mg/dL"),
  number("HDL", "Labs", 45, "High-Density Lipoprotein (HDL)", "mg/dL", "Protective lipoprotein; optimal: >40-50 mg/dL"),
  number("BUN", "Labs", 14, "Blood Urea Nitrogen (BUN)", "mg/dL", "Renal azotemia marker; normal: 7-20 mg/dL"),
  number("ESR", "Labs", 10, "Erythrocyte Sedimentation Rate", "mm/hr", "Inflammatory marker; normal: 0-20 mm/hr"),
  number("HB", "Labs", 14.0, "Hemoglobin (HB)", "g/dL", "Oxygen carriage; normal: 13-17 g/dL"),
  number("K", "Labs", 4.2, "Serum Potassium (K⁺)", "mEq/L", "Electrolyte; normal: 3.5-5.0 mEq/L"),
  number("Na", "Labs", 140, "Serum Sodium (Na⁺)", "mEq/L", "Electrolyte; normal: 135-145 mEq/L"),
  number("WBC", "Labs", 7200, "White Blood Cell Count (WBC)", "cells/µL", "Normal count: 4,000-11,000 /µL"),
  number("Lymph", "Labs", 32, "Lymphocyte Percentage", "%", "Normal differential: 20-40%"),
  number("Neut", "Labs", 60, "Neutrophil Percentage", "%", "Normal differential: 40-70%"),
  number("PLT", "Labs", 240000, "Platelet Count (PLT)", "/µL", "Normal range: 150,000-450,000 /µL"),

  // ECG / Echo
  number("EF-TTE", "ECG / Echo", 55, "Ejection Fraction (Echo EF-TTE)", "%", "Transthoracic echocardiographic LV ejection fraction"),
  binary("Region RWMA", "ECG / Echo", 0, "Regional Wall Motion Abnormality (RWMA)", "Echocardiographic segmental hypokinesia/akinesia"),
  binary("St Elevation", "ECG / Echo", 0, "ST-Segment Elevation", "Acute transmural injury current on 12-lead ECG"),
  binary("St Depression", "ECG / Echo", 0, "ST-Segment Depression", "Subendocardial ischemia on 12-lead ECG"),
  binary("Tinversion", "ECG / Echo", 0, "T-Wave Inversion", "Pathological repolarization asymmetry"),
  binary("Q Wave", "ECG / Echo", 0, "Pathological Q Waves", "Evidence of previous transmural myocardial infarction"),
  binary("LVH", "ECG / Echo", 0, "Left Ventricular Hypertrophy (LVH)", "Sokolow-Lyon or Cornell voltage criteria on ECG"),
  binary("Poor R Progression", "ECG / Echo", 0, "Poor R-Wave Progression (PRWP)", "Delayed precordial transition V1-V4"),
  binary("BBB", "ECG / Echo", 0, "Bundle Branch Block (BBB: LBBB/RBBB)", "Intraventricular conduction delay (QRS >= 120ms)"),
  binary("VHD", "ECG / Echo", 0, "Valvular Heart Disease (VHD)", "Echocardiographic moderate-to-severe valvular pathology"),
];

export const featureGroups = ["Profile", "History", "Symptoms", "Labs", "ECG / Echo"] as const;

export function defaultFeatureValues(): Record<string, number> {
  return Object.fromEntries(featureManifest.map((feature) => [feature.name, feature.defaultValue]));
}
