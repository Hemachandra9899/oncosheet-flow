import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { DEFAULT_COLUMNS, mergeHeaders } from "@/lib/sheet-template";
import {
  extractSpreadsheetId,
  extractSheetGid,
  getGoogleClientsForUser,
} from "@/lib/google";

function quoteSheetName(name: string) {
  return `'${name.replace(/'/g, "''")}'`;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await request.json();

    const spreadsheetUrl = body.spreadsheetUrl || body.spreadsheetId || "";
    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
    const gid = extractSheetGid(spreadsheetUrl);

    const { sheets } = await getGoogleClientsForUser(userId);

    const meta = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });

    const spreadsheetName = meta.data.properties?.title || "Connected Sheet";
    const tabs = meta.data.sheets || [];

    let selectedTab = null;

    if (gid !== null) {
      selectedTab =
        tabs.find((tab) => tab.properties?.sheetId === gid) || null;
    }

    if (!selectedTab) {
      selectedTab = tabs[0] || null;
    }

    const sheetName = selectedTab?.properties?.title;

    if (!sheetName) {
      throw new Error("Could not detect the selected sheet tab.");
    }

    const safeSheetName = quoteSheetName(sheetName);

    const headerResult = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${safeSheetName}!1:1`,
    });

    const existingHeaders = headerResult.data.values?.[0] || [];
    const mergedHeaders = mergeHeaders(existingHeaders.map(String));

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${safeSheetName}!1:1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [mergedHeaders],
      },
    });

    let connection = await prisma.sheetConnection.findFirst({
      where: {
        userId,
        spreadsheetId,
        sheetName,
      },
    });

    if (connection) {
      connection = await prisma.sheetConnection.update({
        where: {
          id: connection.id,
        },
        data: {
          spreadsheetName,
          sheetName,
        },
      });
    } else {
      connection = await prisma.sheetConnection.create({
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
              isDefault: true,
            })),
          },
        },
      });
    }

    return NextResponse.json({
      sheetId: connection.id,
      spreadsheetId,
      spreadsheetName,
      sheetName,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to connect sheet. Make sure the signed-in Google account has Editor access.",
      },
      { status: 400 }
    );
  }
}
