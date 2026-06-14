import { NextRequest, NextResponse } from "next/server";
import { ColumnType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { getGoogleClientsForUser } from "@/lib/google";
import { getTemplate, getTemplateHeaders } from "@/lib/templates";

function quoteSheetName(name: string) {
  return `'${name.replace(/'/g, "''")}'`;
}

function columnToLetter(column: number) {
  let letter = "";

  while (column > 0) {
    const mod = (column - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    column = Math.floor((column - mod) / 26);
  }

  return letter;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json().catch(() => ({}));

    const templateKey = body.templateKey || "oncology_rt";
    const template = getTemplate(templateKey);
    const headers = getTemplateHeaders(templateKey);

    const title = body.title || template.name;
    const sheetName = body.sheetName || template.sheetName;

    const { sheets } = await getGoogleClientsForUser(userId);

    const created = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
        sheets: [{ properties: { title: sheetName } }],
      },
    });

    const spreadsheetId = created.data.spreadsheetId;
    if (!spreadsheetId) throw new Error("Could not create spreadsheet");

    const safeSheetName = quoteSheetName(sheetName);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${safeSheetName}!A1:${columnToLetter(headers.length)}1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [headers] },
    });

    const connection = await prisma.sheetConnection.create({
      data: {
        userId,
        spreadsheetId,
        spreadsheetName: title,
        sheetName,
        templateKey,
        columns: {
          create: template.columns.map((column, index) => ({
            key: column.key,
            label: column.label,
            type: column.type as ColumnType,
            required: column.required,
            order: index,
            isDefault: true,
          })),
        },
      },
    });

    return NextResponse.json({
      sheetId: connection.id,
      spreadsheetId,
      templateKey,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create sheet" },
      { status: 400 }
    );
  }
}
