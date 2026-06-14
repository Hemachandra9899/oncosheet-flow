import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { getGoogleClientsForUser } from "@/lib/google";

function quoteSheetName(name: string) {
  return `'${name.replace(/'/g, "''")}'`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await requireUserId();

    const connection = await prisma.sheetConnection.findFirst({
      where: { id, userId },
    });

    if (!connection) {
      throw new Error("Sheet connection not found");
    }

    const { sheets } = await getGoogleClientsForUser(userId);
    const safeSheetName = quoteSheetName(connection.sheetName);

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: connection.spreadsheetId,
      range: `${safeSheetName}!1:1`,
    });

    return NextResponse.json({
      headers: (result.data.values?.[0] || []).map(String),
      templateKey: connection.templateKey || "oncology_rt",
      spreadsheetName: connection.spreadsheetName,
      sheetName: connection.sheetName,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Could not fetch headers" },
      { status: 400 }
    );
  }
}
