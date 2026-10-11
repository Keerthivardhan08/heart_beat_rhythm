
import type { VesselId } from "./HeartViewer";

export function VesselSelector(props: {
  value: VesselId | null;
  onChange: (value: VesselId) => void;
}) {
  return (
    <label>
      Select vessel
      <select value={props.value ?? ""} onChange={(e) => {
        if (e.target.value) props.onChange(e.target.value as VesselId);
      }}>
        <option value="">Choose…</option>
        <option value="lad">LAD</option>
        <option value="lcx">LCX</option>
        <option value="rca">RCA</option>
      </select>
    </label>
  );
}
