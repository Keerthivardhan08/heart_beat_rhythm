
export const vesselLabels = {
  lad: "Left Anterior Descending artery",
  lcx: "Left Circumflex artery",
  rca: "Right Coronary Artery",
} as const;

// Add verified mesh/object IDs only after inspecting the selected licensed asset.
export const vesselMeshIds: Partial<Record<keyof typeof vesselLabels, string>> = {};
