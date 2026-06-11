import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { DEFAULT_COLUMNS, mergeHeaders } from "@/lib/sheet-template";
import { extractSpreadsheetId, getGoogleClientsForUser } from "@/lib/google";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const spreadsheetId = extractSpreadsheetId(body.spreadsheetUrl || body.spreadsheetId || "");
    const { sheets } = await getGoogleClientsForUser(userId);

    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    const spreadsheetName = meta.data.properties?.title || "Connected Sheet";
    const sheetName = body.sheetName || meta.data.sheets?.[0]?.properties?.title || "Sheet1";

    const headerResult = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`
    });
    const existingHeaders = headerResult.data.values?.[0] || [];
    const mergedHeaders = mergeHeaders(existingHeaders.map(String));

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!1:1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [mergedHeaders] }
    });

    const connection = await prisma.sheetConnection.create({
      data: {
        userId,
        spreadsheetId,
        spreadsheetName,
        sheetName,
        columns: {
          create: DEFAULT_COLUMNS.map((column, index) => ({
            key: column.key,
            label: column.label,
            type: column.type,
            required: column.required,
            order: index,
            isDefault: true
          }))
        }
      }
    });

    return NextResponse.json({ sheetId: connection.id, spreadsheetId, spreadsheetName, sheetName });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to connect sheet" }, { status: 400 });
  }
}
