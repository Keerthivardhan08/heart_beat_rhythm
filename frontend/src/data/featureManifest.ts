export type FeatureType = "number" | "binary";

export interface FeatureDefinition {
  name: string;
  type: FeatureType;
  group: "Profile" | "History" | "Symptoms" | "Labs" | "ECG / Echo";
  defaultValue: number;
}

const binary = (name: string, group: FeatureDefinition["group"], defaultValue = 0): FeatureDefinition => ({
  name,
  type: "binary",
  group,
  defaultValue,
});

const number = (name: string, group: FeatureDefinition["group"], defaultValue: number): FeatureDefinition => ({
  name,
  type: "number",
  group,
  defaultValue,
});

export const featureManifest: FeatureDefinition[] = [
  number("Age", "Profile", 58),
  binary("Sex", "Profile", 1),
  number("BMI", "Profile", 27),
  binary("DM", "History", 0),
  binary("HTN", "History", 1),
  binary("Current Smoker", "History", 0),
  binary("EX-Smoker", "History", 0),
  binary("FH", "History", 0),
  binary("Obesity", "History", 0),
  binary("CRF", "History", 0),
  binary("CVA", "History", 0),
  binary("Airway disease", "History", 0),
  binary("Thyroid Disease", "History", 0),
  binary("CHF", "History", 0),
  binary("DLP", "History", 1),
  number("BP", "Profile", 130),
  number("PR", "Profile", 76),
  binary("Edema", "Symptoms", 0),
  binary("Weak Peripheral Pulse", "Symptoms", 0),
  binary("Lung rales", "Symptoms", 0),
  binary("Systolic Murmur", "Symptoms", 0),
  binary("Diastolic Murmur", "Symptoms", 0),
  binary("Typical Chest Pain", "Symptoms", 1),
  binary("Dyspnea", "Symptoms", 1),
  number("Function Class", "Symptoms", 2),
  binary("Atypical", "Symptoms", 0),
  binary("Nonanginal", "Symptoms", 0),
  binary("LowTH Ang", "Symptoms", 0),
  number("FBS", "Labs", 105),
  number("CR", "Labs", 1),
  number("TG", "Labs", 150),
  number("LDL", "Labs", 110),
  number("HDL", "Labs", 45),
  number("BUN", "Labs", 14),
  number("ESR", "Labs", 10),
  number("HB", "Labs", 14),
  number("K", "Labs", 4.2),
  number("Na", "Labs", 140),
  number("WBC", "Labs", 7200),
  number("Lymph", "Labs", 32),
  number("Neut", "Labs", 60),
  number("PLT", "Labs", 240000),
  binary("Q Wave", "ECG / Echo", 0),
  binary("St Elevation", "ECG / Echo", 0),
  binary("St Depression", "ECG / Echo", 0),
  binary("Tinversion", "ECG / Echo", 0),
  binary("LVH", "ECG / Echo", 0),
  binary("Poor R Progression", "ECG / Echo", 0),
  binary("BBB", "ECG / Echo", 0),
  number("EF-TTE", "ECG / Echo", 55),
  binary("Region RWMA", "ECG / Echo", 0),
  binary("VHD", "ECG / Echo", 0),
];

export const featureGroups = ["Profile", "History", "Symptoms", "Labs", "ECG / Echo"] as const;

export function defaultFeatureValues(): Record<string, number> {
  return Object.fromEntries(featureManifest.map((feature) => [feature.name, feature.defaultValue]));
}
