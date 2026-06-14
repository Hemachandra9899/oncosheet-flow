import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import {
  buildSheetRow,
  validateRequiredRowValues,
} from "@/lib/sheet-template";
import { getGoogleClientsForUser } from "@/lib/google";

function quoteSheetName(name: string) {
  return `'${name.replace(/'/g, "''")}'`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await requireUserId();
    const input = await request.json();

    const connection = await prisma.sheetConnection.findFirst({
      where: { id, userId },
      include: { columns: { orderBy: { order: "asc" } } },
    });
    if (!connection) throw new Error("Sheet connection not found");

    const { sheets } = await getGoogleClientsForUser(userId);
    const safeSheetName = quoteSheetName(connection.sheetName);

    const headersResult = await sheets.spreadsheets.values.get({
      spreadsheetId: connection.spreadsheetId,
      range: `${safeSheetName}!1:1`,
    });
    const headers = (headersResult.data.values?.[0] || []).map(String);

    const serialResult = await sheets.spreadsheets.values.get({
      spreadsheetId: connection.spreadsheetId,
      range: `${safeSheetName}!A:A`,
    });
    const usedRows = serialResult.data.values?.length || 1;
    const nextSerialNo = usedRows;

    const templateKey = connection.templateKey || "oncology_rt";
    const row = buildSheetRow(input, headers, nextSerialNo, templateKey);

    if (row.length !== headers.length) {
      throw new Error(
        `Row verification failed. Expected ${headers.length} cells but got ${row.length}.`
      );
    }

    const missingRequired = validateRequiredRowValues(
      headers,
      row,
      templateKey
    );

    if (missingRequired.length > 0) {
      throw new Error(
        `Missing required fields: ${missingRequired.join(", ")}`
      );
    }

    const appendResult = await sheets.spreadsheets.values.append({
      spreadsheetId: connection.spreadsheetId,
      range: `${safeSheetName}!A:ZZ`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    const updatedRange = appendResult.data.updates?.updatedRange;
    const rowNumber = updatedRange?.match(/![A-Z]+(\d+):/)?.[1];

    const record = await prisma.patientRecord.create({
      data: {
        userId,
        sheetId: connection.id,
        values: input,
        status: "SYNCED",
        googleRowNumber: rowNumber ? Number(rowNumber) : undefined,
      },
    });

    return NextResponse.json({ ok: true, recordId: record.id, rowNumber });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit row" },
      { status: 400 }
    );
  }
}
