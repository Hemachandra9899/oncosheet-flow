export type ColumnKind =
  | "TEXT"
  | "NUMBER"
  | "DATE"
  | "SELECT"
  | "BOOLEAN"
  | "FORMULA";

export type TemplateColumn = {
  key: string;
  label: string;
  type: ColumnKind;
  required: boolean;
  aliases?: string[];
};

export type TemplateStep =
  | {
      id: string;
      label: string;
      title: string;
      type: "text" | "number" | "date" | "textarea";
      placeholder?: string;
      required?: boolean;
    }
  | {
      id: string;
      label: string;
      title: string;
      type: "choice";
      options: string[];
      required?: boolean;
    }
  | {
      id: string;
      label: string;
      title: string;
      type: "grade";
      required?: boolean;
    }
  | {
      id: string;
      label: string;
      title: string;
      type: "preBmi" | "review";
      required?: boolean;
    };

export type OpenSheetTemplate = {
  key: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
  color: string;
  sheetName: string;
  columns: TemplateColumn[];
  steps: TemplateStep[];
};

const reviewStep: TemplateStep = {
  id: "review",
  label: "Review",
  title: "Review row before submit",
  type: "review",
};

export const TEMPLATES: OpenSheetTemplate[] = [
  {
    key: "oncology_rt",
    name: "Oncology RT Patient Report",
    shortName: "Oncology RT",
    description:
      "Head and neck RT patient report with BMI, RT details, toxicity and interruptions.",
    category: "Healthcare",
    color: "bg-[#D9C6FF]",
    sheetName: "Patients",
    columns: [
      { key: "serialNo", label: "S.no", type: "NUMBER", required: false, aliases: ["S No", "S.No"] },
      { key: "patientName", label: "Patient Name", type: "TEXT", required: true },
      { key: "patientId", label: "Patient ID", type: "TEXT", required: true },
      { key: "ageSex", label: "Age/Sex", type: "TEXT", required: true },
      { key: "primarySite", label: "Primary Site", type: "TEXT", required: true },
      { key: "stage", label: "Stage", type: "TEXT", required: false },
      { key: "ecog", label: "ECOG", type: "SELECT", required: false },
      { key: "weightKg", label: "Weight(kg)", type: "NUMBER", required: false, aliases: ["Pre RT Weight(kg)", "Weight"] },
      { key: "height", label: "Height(m)", type: "NUMBER", required: false, aliases: ["Height(cm)", "Height"] },
      { key: "preRtBmi", label: "Pre RT BMI", type: "FORMULA", required: false },
      { key: "bmiGroup", label: "BMI Group", type: "FORMULA", required: false },
      { key: "rtStarted", label: "RT Started", type: "DATE", required: false },
      { key: "rtDoseGy", label: "RT Dose(Gy)", type: "TEXT", required: false },
      { key: "rtTech", label: "RT Tech", type: "SELECT", required: false },
      { key: "rtEnded", label: "RT Ended", type: "DATE", required: false },
      { key: "cctCycles", label: "CCT Cycles", type: "TEXT", required: false },
      { key: "ryles", label: "Ryles", type: "BOOLEAN", required: false },
      { key: "postRtMucositis", label: "Post RT Mucositis", type: "SELECT", required: false },
      { key: "postRtDermatitis", label: "Post RT Dermatitis", type: "SELECT", required: false },
      { key: "postRtDys", label: "Post RT Dys", type: "SELECT", required: false },
      { key: "postRtBmi", label: "Post RT BMI", type: "NUMBER", required: false },
      { key: "treatmentInterruptions", label: "Treatment Interruptions", type: "BOOLEAN", required: false },
    ],
    steps: [
      { id: "patientId", label: "Patient", title: "Patient ID", type: "text", placeholder: "25-05976", required: true },
      { id: "patientName", label: "Patient", title: "Patient name", type: "text", placeholder: "Enter patient name", required: true },
      { id: "age", label: "Patient", title: "Age", type: "number", placeholder: "50" },
      { id: "sex", label: "Patient", title: "Sex", type: "choice", options: ["Male", "Female"] },
      {
        id: "primarySite",
        label: "Diagnosis",
        title: "Primary site",
        type: "choice",
        options: ["Ca Hypopharynx", "Ca Tongue", "Ca Bm", "Ca Oropharynx", "Ca Nasopharynx", "Ca Post Cricoid", "Other"],
      },
      { id: "stage", label: "Diagnosis", title: "Stage", type: "text", placeholder: "T2N2M0" },
      { id: "ecog", label: "Diagnosis", title: "ECOG", type: "choice", options: ["0", "1", "2", "3", "4"] },
      { id: "preBmi", label: "BMI", title: "Weight, height and BMI", type: "preBmi" },
      { id: "rtStarted", label: "RT", title: "RT started", type: "date" },
      { id: "rtDoseGy", label: "RT", title: "RT dose", type: "choice", options: ["66gy 33#", "60gy 30#", "70gy 35#", "68gy 34#", "Other"] },
      { id: "rtTech", label: "RT", title: "RT technique", type: "choice", options: ["IMRT", "RADICAL RT", "ADJRT IMRT", "Other"] },
      { id: "rtEnded", label: "RT", title: "RT ended", type: "date" },
      { id: "cctCycles", label: "Treatment", title: "CCT cycles", type: "text", placeholder: "4 cisplatin" },
      { id: "ryles", label: "Treatment", title: "Ryles", type: "choice", options: ["Yes", "No"] },
      { id: "postRtMucositis", label: "Toxicity", title: "Post RT mucositis", type: "grade" },
      { id: "postRtDermatitis", label: "Toxicity", title: "Post RT dermatitis", type: "grade" },
      { id: "postRtDys", label: "Toxicity", title: "Post RT dysphagia", type: "grade" },
      { id: "postRtBmi", label: "BMI", title: "Post RT BMI", type: "number", placeholder: "14.53" },
      { id: "treatmentInterruptions", label: "Final", title: "Treatment interruptions", type: "choice", options: ["Yes", "No"] },
      reviewStep,
    ],
  },

  {
    key: "breast_rt",
    name: "Breast Cancer RT Report",
    shortName: "Breast RT",
    description:
      "Breast cancer report with clinical stage, histology, IHC, PET-CT and clip cavity details.",
    category: "Healthcare",
    color: "bg-[#BDEAF3]",
    sheetName: "Breast RT",
    columns: [
      { key: "name", label: "Name", type: "TEXT", required: true },
      { key: "age", label: "Age", type: "NUMBER", required: false },
      { key: "ipNo", label: "IP No:", type: "TEXT", required: true, aliases: ["IP No", "IP Number"] },
      { key: "diagnosis", label: "Diagnosis", type: "TEXT", required: true },
      { key: "quadrantLocation", label: "Quadrant/Location", type: "TEXT", required: false },
      { key: "clinicalStage", label: "Clinical  Stage", type: "TEXT", required: false, aliases: ["Clinical Stage"] },
      { key: "histology", label: "Histology", type: "TEXT", required: false },
      { key: "grade", label: "Grade", type: "TEXT", required: false, aliases: ["Grade "] },
      { key: "ihc", label: "IHC", type: "TEXT", required: false },
      { key: "prognosticStage", label: "Prognostic Stage", type: "TEXT", required: false },
      { key: "pathologicalStage", label: "Pathological Stage", type: "TEXT", required: false },
      { key: "petCtVolume", label: "PET-CT Volume", type: "TEXT", required: false },
      { key: "postOpClipCavityVolume", label: "Post Op Clip cavity volume", type: "TEXT", required: false },
      {
        key: "lumpectomyCavityDisplacement",
        label: "Dsiplacement of Lumpectomy Cavity based on clips",
        type: "TEXT",
        required: false,
        aliases: ["Displacement of Lumpectomy Cavity based on clips"],
      },
    ],
    steps: [
      { id: "ipNo", label: "Patient", title: "IP No", type: "text", placeholder: "25-04270", required: true },
      { id: "name", label: "Patient", title: "Name", type: "text", placeholder: "Jamila Begum", required: true },
      { id: "age", label: "Patient", title: "Age", type: "number", placeholder: "40" },
      { id: "diagnosis", label: "Diagnosis", title: "Diagnosis", type: "text", placeholder: "Ca Rt Breast", required: true },
      { id: "quadrantLocation", label: "Diagnosis", title: "Quadrant / Location", type: "text" },
      { id: "clinicalStage", label: "Staging", title: "Clinical stage", type: "text", placeholder: "CT2N1M0" },
      { id: "histology", label: "Pathology", title: "Histology", type: "text", placeholder: "IDCC" },
      { id: "grade", label: "Pathology", title: "Grade", type: "choice", options: ["1", "2", "3", "Other"] },
      { id: "ihc", label: "Pathology", title: "IHC", type: "textarea", placeholder: "ER/PR/HER2 details" },
      { id: "prognosticStage", label: "Staging", title: "Prognostic stage", type: "text" },
      { id: "pathologicalStage", label: "Staging", title: "Pathological stage", type: "text", placeholder: "PT1N0M0" },
      { id: "petCtVolume", label: "Volume", title: "PET-CT volume", type: "text" },
      { id: "postOpClipCavityVolume", label: "Volume", title: "Post Op Clip cavity volume", type: "text" },
      { id: "lumpectomyCavityDisplacement", label: "Volume", title: "Displacement of lumpectomy cavity based on clips", type: "textarea" },
      reviewStep,
    ],
  },
];

export function getTemplate(templateKey?: string | null) {
  return TEMPLATES.find((template) => template.key === templateKey) || TEMPLATES[0];
}

export function getTemplateHeaders(templateKey?: string | null) {
  return getTemplate(templateKey).columns.map((column) => column.label);
}

export function getRequiredTemplateHeaders(templateKey?: string | null) {
  return getTemplate(templateKey)
    .columns
    .filter((column) => column.required)
    .map((column) => column.label);
}
