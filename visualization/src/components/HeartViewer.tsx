
import type { ReactNode } from "react";

export type VesselId = "lad" | "lcx" | "rca";

export interface HeartViewerProps {
  selectedVessel?: VesselId | null;
  onSelectVessel?: (vessel: VesselId) => void;
}

/**
 * Starter placeholder. Replace with a licensed anatomical model and verified
 * vessel-to-mesh mapping before presenting as an anatomical viewer.
 */
export function HeartViewer({ selectedVessel, onSelectVessel }: HeartViewerProps): ReactNode {
  return (
    <section aria-label="Coronary anatomy viewer">
      <p>3D anatomy viewer is not configured yet.</p>
      <p>Selected vessel: {selectedVessel ?? "none"}</p>
      <button type="button" onClick={() => onSelectVessel?.("lad")}>
        Demo-select LAD (placeholder)
      </button>
      <p role="note">
        Placeholder only; no patient-specific lesion geometry is represented.
      </p>
    </section>
  );
}
