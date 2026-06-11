import { ColumnType } from "@prisma/client";
import { calculateBMI, getBMIGroup } from "./bmi";

export const DEFAULT_COLUMNS = [
  { key: "serialNo", label: "S.no", type: ColumnType.NUMBER, required: false },
  { key: "patientName", label: "Patient Name", type: ColumnType.TEXT, required: true },
  { key: "patientId", label: "Patient ID", type: ColumnType.TEXT, required: true },
  { key: "ageSex", label: "Age/Sex", type: ColumnType.TEXT, required: true },
  { key: "primarySite", label: "Primary Site", type: ColumnType.TEXT, required: true },
  { key: "stage", label: "Stage", type: ColumnType.TEXT, required: false },
  { key: "ecog", label: "ECOG", type: ColumnType.SELECT, required: false },
  { key: "preRtWeightKg", label: "Pre RT Weight(kg)", type: ColumnType.NUMBER, required: false },
  { key: "heightCm", label: "Height(cm)", type: ColumnType.NUMBER, required: false },
  { key: "preRtBmi", label: "Pre RT BMI", type: ColumnType.FORMULA, required: false },
  { key: "bmiGroup", label: "BMI Group", type: ColumnType.FORMULA, required: false },
  { key: "rtStarted", label: "RT Started", type: ColumnType.DATE, required: false },
  { key: "rtDoseGy", label: "RT Dose(Gy)", type: ColumnType.TEXT, required: false },
  { key: "rtTech", label: "RT Tech", type: ColumnType.SELECT, required: false },
  { key: "rtEnded", label: "RT Ended", type: ColumnType.DATE, required: false },
  { key: "cctCycles", label: "CCT Cycles", type: ColumnType.TEXT, required: false },
  { key: "ryles", label: "Ryles", type: ColumnType.BOOLEAN, required: false },
  { key: "postRtMucositis", label: "Post RT Mucositis", type: ColumnType.SELECT, required: false },
  { key: "postRtDermatitis", label: "Post RT Dermatitis", type: ColumnType.SELECT, required: false },
  { key: "postRtDys", label: "Post RT Dys", type: ColumnType.SELECT, required: false },
  { key: "postRtWeightKg", label: "Post RT Weight(kg)", type: ColumnType.NUMBER, required: false },
  { key: "postRtBmi", label: "Post RT BMI", type: ColumnType.FORMULA, required: false },
  { key: "treatmentInterruptions", label: "Treatment Interruptions", type: ColumnType.BOOLEAN, required: false },
  { key: "notes", label: "Notes", type: ColumnType.TEXT, required: false }
] as const;

export const DEFAULT_HEADERS = DEFAULT_COLUMNS.map((column) => column.label);

export function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

export function mergeHeaders(existing: string[]) {
  const seen = new Set(existing.map(normalizeHeader));
  const merged = [...existing];
  for (const header of DEFAULT_HEADERS) {
    if (!seen.has(normalizeHeader(header))) merged.push(header);
  }
  return merged;
}

type PatientValues = Record<string, any>;

export function buildSheetRow(input: PatientValues, headers: string[], serialNo: number) {
  const preBmi = calculateBMI(Number(input.preRtWeightKg), Number(input.heightCm));
  const postBmi = calculateBMI(Number(input.postRtWeightKg), Number(input.heightCm));

  const ageSex = input.age && input.sex ? `${input.age}/${String(input.sex).slice(0, 1).toLowerCase()}` : input.ageSex || "";

  const defaults: Record<string, any> = {
    "S.no": serialNo,
    "Patient Name": input.patientName || "",
    "Patient ID": input.patientId || "",
    "Age/Sex": ageSex,
    "Primary Site": input.primarySite || "",
    "Stage": input.stage || "",
    "ECOG": input.ecog || "",
    "Pre RT Weight(kg)": input.preRtWeightKg || "",
    "Height(cm)": input.heightCm || "",
    "Pre RT BMI": preBmi ?? "",
    "BMI Group": getBMIGroup(preBmi),
    "RT Started": input.rtStarted || "",
    "RT Dose(Gy)": input.rtDoseGy || "",
    "RT Tech": input.rtTech || "",
    "RT Ended": input.rtEnded || "",
    "CCT Cycles": input.cctCycles || "",
    "Ryles": input.ryles || "",
    "Post RT Mucositis": input.postRtMucositis || "",
    "Post RT Dermatitis": input.postRtDermatitis || "",
    "Post RT Dys": input.postRtDys || "",
    "Post RT Weight(kg)": input.postRtWeightKg || "",
    "Post RT BMI": postBmi ?? "",
    "Treatment Interruptions": input.treatmentInterruptions || "",
    "Notes": input.notes || ""
  };

  const custom = input.custom || {};

  return headers.map((header) => {
    if (Object.prototype.hasOwnProperty.call(defaults, header)) return defaults[header];
    return custom[header] ?? input[header] ?? "";
  });
}
