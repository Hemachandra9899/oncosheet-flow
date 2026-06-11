import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { DEFAULT_COLUMNS, DEFAULT_HEADERS } from "@/lib/sheet-template";
import { getGoogleClientsForUser } from "@/lib/google";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json().catch(() => ({}));
    const title = body.title || `OncoSheet Flow - Patients`;
    const sheetName = body.sheetName || "Patients";
    const { sheets } = await getGoogleClientsForUser(userId);

    const created = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
        sheets: [{ properties: { title: sheetName } }]
      }
    });

    const spreadsheetId = created.data.spreadsheetId;
    if (!spreadsheetId) throw new Error("Could not create spreadsheet");

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:${String.fromCharCode(64 + DEFAULT_HEADERS.length)}1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [DEFAULT_HEADERS] }
    });

    const connection = await prisma.sheetConnection.create({
      data: {
        userId,
        spreadsheetId,
        spreadsheetName: title,
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

    return NextResponse.json({ sheetId: connection.id, spreadsheetId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create sheet" }, { status: 400 });
  }
}
