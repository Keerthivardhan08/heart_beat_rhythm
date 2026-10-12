
import type { FeatureDefinition } from "../data/featureManifest";

interface PatientDataFormProps {
  features: FeatureDefinition[];
  values: Record<string, number>;
  disabled?: boolean;
  onChange: (name: string, value: number) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function PatientDataForm({
  features,
  values,
  disabled = false,
  onChange,
  onSubmit,
  onReset,
}: PatientDataFormProps) {
  return (
    <form
      className="feature-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="form-grid">
        {features.map((feature) => (
          <label className="field" key={feature.name}>
            <span>{feature.name}</span>
            {feature.type === "binary" ? (
              <select
                value={values[feature.name] ?? 0}
                disabled={disabled}
                onChange={(event) => onChange(feature.name, Number(event.target.value))}
              >
                <option value={0}>No / 0</option>
                <option value={1}>Yes / 1</option>
              </select>
            ) : (
              <input
                type="number"
                step="any"
                value={values[feature.name] ?? ""}
                disabled={disabled}
                onChange={(event) => onChange(feature.name, Number(event.target.value))}
              />
            )}
          </label>
        ))}
      </div>
      <div className="form-actions">
        <button className="ghost" type="button" onClick={onReset} disabled={disabled}>
          Reset sample
        </button>
        <button className="primary" type="submit" disabled={disabled}>
          Run analysis
        </button>
      </div>
    </form>
  );
}
