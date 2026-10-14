import { useState, useEffect } from "react";
import type { PredictionResponse, TargetId } from "../types/api";

export interface StoredPatientRecord {
  id: string;
  name: string;
  date: string;
  age: number;
  sex: "Male" | "Female";
  bp: number;
  pr: number;
  ef: number;
  typicalChestPain: boolean;
  cadScore: number;
  cadStatus: "Elevated" | "Normal";
  ladScore: number;
  lcxScore: number;
  rcaScore: number;
  primaryRiskVessel: string;
  features: Record<string, number>;
  predictions: PredictionResponse;
}

const SEED_RECORDS: StoredPatientRecord[] = [
  {
    id: "CV-2026-9041",
    name: "Patient #9041 (Emergency Referral)",
    date: "2026-10-14 18:45",
    age: 65,
    sex: "Male",
    bp: 150,
    pr: 82,
    ef: 35,
    typicalChestPain: true,
    cadScore: 96,
    cadStatus: "Elevated",
    ladScore: 94,
    lcxScore: 14,
    rcaScore: 18,
    primaryRiskVessel: "LAD (Anterior Wall Infarct Risk)",
    features: {
      Age: 65,
      Sex: 1,
      BP: 150,
      PR: 82,
      "Typical Chest Pain": 1,
      "EF-TTE": 35,
      "Region RWMA": 3,
      "St Elevation": 1,
      HTN: 1,
      DM: 1,
    },
    predictions: {
      status: "ok",
      model_version: "CardioVision3D-provisional",
      predictions: {
        cad: {
          label: "positive",
          predicted_class: "CAD",
          probability: 0.96,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "CAD",
        },
        lad: {
          label: "positive",
          predicted_class: "Stenotic",
          probability: 0.94,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "Stenotic",
        },
        lcx: {
          label: "negative",
          predicted_class: "Normal",
          probability: 0.14,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "Stenotic",
        },
        rca: {
          label: "negative",
          predicted_class: "Normal",
          probability: 0.18,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "Stenotic",
        },
      },
      notice: "Research prototype",
      warnings: [],
    },
  },
  {
    id: "CV-2026-8820",
    name: "Patient #8820 (Outpatient Cardiology)",
    date: "2026-10-14 15:20",
    age: 60,
    sex: "Female",
    bp: 138,
    pr: 74,
    ef: 48,
    typicalChestPain: true,
    cadScore: 84,
    cadStatus: "Elevated",
    ladScore: 22,
    lcxScore: 88,
    rcaScore: 16,
    primaryRiskVessel: "LCX (Lateral Wall Ischemia)",
    features: {
      Age: 60,
      Sex: 0,
      BP: 138,
      PR: 74,
      "Typical Chest Pain": 1,
      "EF-TTE": 48,
      "Region RWMA": 1,
      "St Depression": 1,
      DLP: 1,
    },
    predictions: {
      status: "ok",
      model_version: "CardioVision3D-provisional",
      predictions: {
        cad: {
          label: "positive",
          predicted_class: "CAD",
          probability: 0.84,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "CAD",
        },
        lad: {
          label: "negative",
          predicted_class: "Normal",
          probability: 0.22,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "Stenotic",
        },
        lcx: {
          label: "positive",
          predicted_class: "Stenotic",
          probability: 0.88,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "Stenotic",
        },
        rca: {
          label: "negative",
          predicted_class: "Normal",
          probability: 0.16,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "Stenotic",
        },
      },
      notice: "Research prototype",
      warnings: [],
    },
  },
  {
    id: "CV-2026-7645",
    name: "Patient #7645 (Inpatient Cath Lab)",
    date: "2026-10-13 11:10",
    age: 68,
    sex: "Male",
    bp: 110,
    pr: 52,
    ef: 42,
    typicalChestPain: true,
    cadScore: 89,
    cadStatus: "Elevated",
    ladScore: 19,
    lcxScore: 24,
    rcaScore: 92,
    primaryRiskVessel: "RCA (Inferior Infarct & Bradycardia)",
    features: {
      Age: 68,
      Sex: 1,
      BP: 110,
      PR: 52,
      "Typical Chest Pain": 1,
      "EF-TTE": 42,
      "Region RWMA": 2,
      "St Elevation": 1,
      DM: 1,
      HTN: 1,
    },
    predictions: {
      status: "ok",
      model_version: "CardioVision3D-provisional",
      predictions: {
        cad: {
          label: "positive",
          predicted_class: "CAD",
          probability: 0.89,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "CAD",
        },
        lad: {
          label: "negative",
          predicted_class: "Normal",
          probability: 0.19,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "Stenotic",
        },
        lcx: {
          label: "negative",
          predicted_class: "Normal",
          probability: 0.24,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "Stenotic",
        },
        rca: {
          label: "positive",
          predicted_class: "Stenotic",
          probability: 0.92,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "Stenotic",
        },
      },
      notice: "Research prototype",
      warnings: [],
    },
  },
  {
    id: "CV-2026-6211",
    name: "Patient #6211 (Executive Health Exam)",
    date: "2026-10-12 09:30",
    age: 38,
    sex: "Female",
    bp: 116,
    pr: 68,
    ef: 64,
    typicalChestPain: false,
    cadScore: 5,
    cadStatus: "Normal",
    ladScore: 8,
    lcxScore: 6,
    rcaScore: 7,
    primaryRiskVessel: "None (Healthy Patent Arteries)",
    features: {
      Age: 38,
      Sex: 0,
      BP: 116,
      PR: 68,
      "Typical Chest Pain": 0,
      "EF-TTE": 64,
      "Region RWMA": 0,
      "St Elevation": 0,
      DM: 0,
      HTN: 0,
    },
    predictions: {
      status: "ok",
      model_version: "CardioVision3D-provisional",
      predictions: {
        cad: {
          label: "negative",
          predicted_class: "Normal",
          probability: 0.05,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "CAD",
        },
        lad: {
          label: "negative",
          predicted_class: "Normal",
          probability: 0.08,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "Stenotic",
        },
        lcx: {
          label: "negative",
          predicted_class: "Normal",
          probability: 0.06,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "Stenotic",
        },
        rca: {
          label: "negative",
          predicted_class: "Normal",
          probability: 0.07,
          threshold: 0.5,
          threshold_status: "Verified",
          positive_class: "Stenotic",
        },
      },
      notice: "Research prototype",
      warnings: [],
    },
  },
];

interface AdminRecordsProps {
  onLoadPatientIntoViewer: (record: StoredPatientRecord) => void;
  onOpenReportModal: (features: Record<string, number>, prediction: PredictionResponse) => void;
}

export function AdminRecords({
  onLoadPatientIntoViewer,
  onOpenReportModal,
}: AdminRecordsProps) {
  const [records, setRecords] = useState<StoredPatientRecord[]>(() => {
    try {
      const stored = localStorage.getItem("cardiovision_patient_records");
      return stored ? JSON.parse(stored) : SEED_RECORDS;
    } catch {
      return SEED_RECORDS;
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState<"all" | "elevated" | "normal">("all");

  useEffect(() => {
    try {
      localStorage.setItem("cardiovision_patient_records", JSON.stringify(records));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }, [records]);

  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete patient record ${id}?`)) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Patient ID",
      "Date",
      "Age",
      "Sex",
      "BP (mmHg)",
      "EF (%)",
      "CAD Risk (%)",
      "LAD Risk (%)",
      "LCX Risk (%)",
      "RCA Risk (%)",
      "Primary Vessel Finding",
    ];
    const rows = records.map((r) => [
      r.id,
      r.date,
      r.age,
      r.sex,
      r.bp,
      r.ef,
      r.cadScore,
      r.ladScore,
      r.lcxScore,
      r.rcaScore,
      `"${r.primaryRiskVessel}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CardioVision_Patients_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.primaryRiskVessel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier =
      filterTier === "all" ||
      (filterTier === "elevated" && r.cadStatus === "Elevated") ||
      (filterTier === "normal" && r.cadStatus === "Normal");

    return matchesSearch && matchesTier;
  });

  const totalPatients = records.length;
  const elevatedCount = records.filter((r) => r.cadStatus === "Elevated").length;
  const normalCount = records.filter((r) => r.cadStatus === "Normal").length;

  return (
    <section className="admin-records-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">HOSPITAL ADMINISTRATIVE PORTAL & PATIENT ARCHIVE</p>
          <h2>Cardiovascular Patient Registry & Clinical Vault</h2>
        </div>
        <div className="admin-status-pill">
          <span className="live-dot" />
          <span>Admin: Dr. Keerthivardhan (Cardiology Lead)</span>
        </div>
      </div>

      {/* Admin KPI Header Tiles */}
      <div className="admin-kpi-grid">
        <article className="kpi-card panel">
          <span className="kpi-label">Total Stored Patients</span>
          <strong className="kpi-value text-accent">{totalPatients}</strong>
          <span className="kpi-sub">Encrypted Local Database</span>
        </article>
        <article className="kpi-card panel">
          <span className="kpi-label">Elevated Ischemic Risk</span>
          <strong className="kpi-value text-danger">{elevatedCount}</strong>
          <span className="kpi-sub">Requires Cath Lab Review</span>
        </article>
        <article className="kpi-card panel">
          <span className="kpi-label">Normal / Patent Vessels</span>
          <strong className="kpi-value text-success">{normalCount}</strong>
          <span className="kpi-sub">Conservative Management</span>
        </article>
        <article className="kpi-card panel">
          <span className="kpi-label">Model Architecture</span>
          <strong className="kpi-value text-info">4 Pipelines</strong>
          <span className="kpi-sub">CAD, LAD, LCX, RCA Trained</span>
        </article>
      </div>

      {/* Toolbar & Filter Bar */}
      <div className="admin-controls-panel panel">
        <div className="search-filter-row">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by Patient ID, Name, or Risk Vessel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>

          <div className="tier-filter-group">
            <button
              type="button"
              className={filterTier === "all" ? "active" : ""}
              onClick={() => setFilterTier("all")}
            >
              All Records ({records.length})
            </button>
            <button
              type="button"
              className={filterTier === "elevated" ? "active text-danger" : ""}
              onClick={() => setFilterTier("elevated")}
            >
              High Risk ({elevatedCount})
            </button>
            <button
              type="button"
              className={filterTier === "normal" ? "active text-success" : ""}
              onClick={() => setFilterTier("normal")}
            >
              Normal ({normalCount})
            </button>
          </div>

          <div className="admin-actions-group">
            <button type="button" className="primary export-csv-btn" onClick={handleExportCSV}>
              📥 Export Registry (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Patient Database Table */}
      <div className="panel table-responsive-panel">
        <table className="admin-patient-table">
          <thead>
            <tr>
              <th>Patient ID & Date</th>
              <th>Demographics</th>
              <th>Vitals & Echo</th>
              <th>Overall CAD</th>
              <th>LAD (Anterior)</th>
              <th>LCX (Lateral)</th>
              <th>RCA (Inferior)</th>
              <th>Primary Clinical Finding</th>
              <th>Clinical Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "28px" }}>
                  No patient records match the active search filter.
                </td>
              </tr>
            ) : (
              filteredRecords.map((patient) => {
                const isCadElevated = patient.cadStatus === "Elevated";
                return (
                  <tr key={patient.id} className={isCadElevated ? "row-risk" : "row-safe"}>
                    <td>
                      <strong>{patient.id}</strong>
                      <div className="table-sub-text">{patient.date}</div>
                    </td>
                    <td>
                      <div>
                        {patient.age} yrs • {patient.sex}
                      </div>
                      <div className="table-sub-text">
                        {patient.typicalChestPain ? "Angina: Typical" : "Angina: None"}
                      </div>
                    </td>
                    <td>
                      <div>BP: {patient.bp} mmHg</div>
                      <div className="table-sub-text">Echo EF: {patient.ef}%</div>
                    </td>
                    <td>
                      <span className={`pill-score ${isCadElevated ? "score-high" : "score-low"}`}>
                        {patient.cadScore}% {isCadElevated ? "▲ Risk" : "● Low"}
                      </span>
                    </td>
                    <td>
                      <span className={`score-tag ${patient.ladScore >= 50 ? "tag-red" : "tag-gray"}`}>
                        {patient.ladScore}%
                      </span>
                    </td>
                    <td>
                      <span className={`score-tag ${patient.lcxScore >= 50 ? "tag-orange" : "tag-gray"}`}>
                        {patient.lcxScore}%
                      </span>
                    </td>
                    <td>
                      <span className={`score-tag ${patient.rcaScore >= 50 ? "tag-green" : "tag-gray"}`}>
                        {patient.rcaScore}%
                      </span>
                    </td>
                    <td>
                      <span className="finding-badge">{patient.primaryRiskVessel}</span>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="btn-action-3d"
                          onClick={() => onLoadPatientIntoViewer(patient)}
                          title="Load this patient into 3D Heart Viewer"
                        >
                          👁️ 3D View
                        </button>
                        <button
                          type="button"
                          className="btn-action-report"
                          onClick={() => onOpenReportModal(patient.features, patient.predictions)}
                          title="Generate Clinical PDF / Report"
                        >
                          📄 Report
                        </button>
                        <button
                          type="button"
                          className="btn-action-delete"
                          onClick={() => handleDelete(patient.id)}
                          title="Delete Record"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
