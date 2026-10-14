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
        {features.map((feature) => {
          const val = values[feature.name] ?? feature.defaultValue;
          const labelText = feature.label || feature.name;

          return (
            <div className="field-card" key={feature.name}>
              <div className="field-header">
                <span className="field-label" title={feature.description || feature.name}>
                  {labelText}
                </span>
                {feature.unit && <span className="unit-badge">{feature.unit}</span>}
              </div>

              {feature.type === "binary" ? (
                <div className="select-wrapper">
                  <select
                    className="custom-select"
                    value={val}
                    disabled={disabled}
                    onChange={(event) => onChange(feature.name, Number(event.target.value))}
                  >
                    {feature.options ? (
                      feature.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))
                    ) : feature.name === "Sex" ? (
                      <>
                        <option value={1}>Male</option>
                        <option value={0}>Female</option>
                      </>
                    ) : (
                      <>
                        <option value={0}>No</option>
                        <option value={1}>Yes</option>
                      </>
                    )}
                  </select>
                </div>
              ) : (
                <div className="input-wrapper">
                  <input
                    type="number"
                    step="any"
                    className="custom-input"
                    value={val === 0 && values[feature.name] === undefined ? "" : val}
                    disabled={disabled}
                    placeholder={String(feature.defaultValue)}
                    onChange={(event) => onChange(feature.name, Number(event.target.value))}
                  />
                </div>
              )}

              {feature.description && (
                <span className="field-hint" title={feature.description}>
                  {feature.description}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="form-actions">
        <button className="ghost" type="button" onClick={onReset} disabled={disabled}>
          Reset Section
        </button>
        <button className="primary" type="submit" disabled={disabled}>
          {disabled ? "Processing..." : "Run Analysis"}
        </button>
      </div>
    </form>
  );
}
