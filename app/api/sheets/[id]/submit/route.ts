import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { getGoogleClientsForUser } from "@/lib/google";
import { buildSheetRow } from "@/lib/sheet-template";
import { calculateBMI, getBMIGroup } from "@/lib/bmi";

function quoteSheetName(name: string) {
  return `'${name.replace(/'/g, "''")}'`;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").replace(/\s*:\s*$/g, "").trim();
}

function findHeader(headers: string[], candidates: string[]) {
  const normalizedCandidates = candidates.map(normalize);
  return headers.find((header) => normalizedCandidates.includes(normalize(header)));
}

function getRowValueForHeader(
  rowValues: Record<string, any>,
  header: string
) {
  if (Object.prototype.hasOwnProperty.call(rowValues, header)) {
    return rowValues[header];
  }

  const normalizedHeader = normalize(header);

  const matchedKey = Object.keys(rowValues).find(
    (key) => normalize(key) === normalizedHeader
  );

  return matchedKey ? rowValues[matchedKey] : "";
}

function buildExactRowFromHeaders(
  headers: string[],
  rowValues: Record<string, any>,
  serialNo: number
) {
  const weightHeader = findHeader(headers, [
    "Weight(kg)",
    "Pre RT Weight(kg)",
    "Pre RT Weight(k",
    "Weight",
  ]);

  const heightHeader = findHeader(headers, [
    "Height(m)",
    "Height(cm)",
    "Height",
  ]);

  const weight = weightHeader
    ? Number(getRowValueForHeader(rowValues, weightHeader))
    : NaN;

  const height = heightHeader
    ? Number(getRowValueForHeader(rowValues, heightHeader))
    : NaN;

  const preBmi = calculateBMI(weight, height);

  return headers.map((header) => {
    const normalized = normalize(header);

    if (normalized === "s.no" || normalized === "s no" || normalized === "sno") {
      return serialNo;
    }

    if (normalized === "pre rt bmi") {
      return preBmi ?? getRowValueForHeader(rowValues, header);
    }

    if (normalized === "bmi group") {
      return preBmi ? getBMIGroup(preBmi) : getRowValueForHeader(rowValues, header);
    }

    return getRowValueForHeader(rowValues, header);
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || id === "undefined") {
      throw new Error("Missing sheet connection id.");
    }

    const userId = await requireUserId();
    const input = await request.json();

    const connection = await prisma.sheetConnection.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        columns: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!connection) {
      throw new Error("Sheet connection not found");
    }

    const { sheets } = await getGoogleClientsForUser(userId);
    const safeSheetName = quoteSheetName(connection.sheetName);

    const headersResult = await sheets.spreadsheets.values.get({
      spreadsheetId: connection.spreadsheetId,
      range: `${safeSheetName}!1:1`,
    });

    const headers = (headersResult.data.values?.[0] || []).map(String);

    if (headers.length === 0) {
      throw new Error("This sheet has no header row.");
    }

    const serialResult = await sheets.spreadsheets.values.get({
      spreadsheetId: connection.spreadsheetId,
      range: `${safeSheetName}!A:A`,
    });

    const usedRows = serialResult.data.values?.length || 1;
    const nextSerialNo = usedRows;

    const row = input.rowValues
      ? buildExactRowFromHeaders(headers, input.rowValues, nextSerialNo)
      : buildSheetRow(input, headers, nextSerialNo);

    if (row.length !== headers.length) {
      throw new Error(
        `Row verification failed. Expected ${headers.length} cells but got ${row.length}.`
      );
    }

    const appendResult = await sheets.spreadsheets.values.append({
      spreadsheetId: connection.spreadsheetId,
      range: `${safeSheetName}!A:ZZ`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [row],
      },
    });

    const updatedRange = appendResult.data.updates?.updatedRange;
    const rowNumber = updatedRange?.match(/![A-Z]+(\d+):/)?.[1];

    const record = await prisma.patientRecord.create({
      data: {
        userId,
        sheetId: connection.id,
        values: input.rowValues || input,
        status: "SYNCED",
        googleRowNumber: rowNumber ? Number(rowNumber) : undefined,
      },
    });

    return NextResponse.json({
      ok: true,
      recordId: record.id,
      rowNumber,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit row" },
      { status: 400 }
    );
  }
}
