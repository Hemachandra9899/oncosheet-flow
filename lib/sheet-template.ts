import { calculateBMI, getBMIGroup } from "./bmi";
import {
  getRequiredTemplateHeaders,
  getTemplate,
  getTemplateHeaders,
  TemplateColumn,
} from "./templates";

export const DEFAULT_COLUMNS = getTemplate("oncology_rt").columns;
export const DEFAULT_HEADERS = getTemplateHeaders("oncology_rt");

export function normalizeHeader(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*:\s*$/g, "")
    .trim();
}

export function findColumnForHeader(
  header: string,
  templateKey = "oncology_rt"
): TemplateColumn | null {
  const normalized = normalizeHeader(header);
  const template = getTemplate(templateKey);

  return (
    template.columns.find((column) => {
      const names = [column.label, ...(column.aliases || [])];
      return names.some((name) => normalizeHeader(name) === normalized);
    }) || null
  );
}

export function mergeHeaders(existing: string[], templateKey = "oncology_rt") {
  const template = getTemplate(templateKey);
  const seen = new Set<string>();

  for (const header of existing) {
    const matched = findColumnForHeader(header, templateKey);
    if (matched) {
      seen.add(matched.key);
    } else {
      seen.add(normalizeHeader(header));
    }
  }

  const merged = [...existing];

  for (const column of template.columns) {
    if (!seen.has(column.key)) {
      merged.push(column.label);
    }
  }

  return merged;
}

type Values = Record<string, any>;

function readValue(input: Values, key: string) {
  return input[key] ?? input.custom?.[key] ?? "";
}

export function buildSheetRow(
  input: Values,
  headers: string[],
  serialNo: number,
  templateKey = "oncology_rt"
) {
  const template = getTemplate(templateKey);

  const preBmi = calculateBMI(Number(input.weightKg), Number(input.height));

  const ageSex =
    input.age && input.sex
      ? `${input.age}/${String(input.sex).slice(0, 1).toLowerCase()}`
      : input.ageSex || "";

  const computedByKey: Record<string, any> = {
    serialNo,
    ageSex,
    preRtBmi: preBmi ?? "",
    bmiGroup: getBMIGroup(preBmi),
  };

  const valueByKey: Record<string, any> = {};

  for (const column of template.columns) {
    if (computedByKey[column.key] !== undefined) {
      valueByKey[column.key] = computedByKey[column.key];
    } else {
      valueByKey[column.key] = readValue(input, column.key);
    }
  }

  return headers.map((header) => {
    const matchedColumn = findColumnForHeader(header, templateKey);

    if (matchedColumn) {
      return valueByKey[matchedColumn.key] ?? "";
    }

    return input[header] ?? input.custom?.[header] ?? "";
  });
}

export function validateRequiredRowValues(
  headers: string[],
  row: any[],
  templateKey = "oncology_rt"
) {
  const requiredHeaders = getRequiredTemplateHeaders(templateKey);

  return requiredHeaders.filter((requiredHeader) => {
    const requiredColumn = findColumnForHeader(requiredHeader, templateKey);

    const index = headers.findIndex((header) => {
      const currentColumn = findColumnForHeader(header, templateKey);
      return currentColumn?.key === requiredColumn?.key;
    });

    return index === -1 || !String(row[index] || "").trim();
  });
}
