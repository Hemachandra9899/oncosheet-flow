export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const userId = await getUserIdFromSession();

  if (!userId) {
    redirect("/");
  }

  const sheets = await prisma.sheetConnection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          records: true,
        },
      },
    },
  });

  const formattedSheets = sheets.map((sheet) => ({
    id: sheet.id,
    spreadsheetId: sheet.spreadsheetId,
    spreadsheetName: sheet.spreadsheetName,
    sheetName: sheet.sheetName,
    createdAt: sheet.createdAt.toISOString(),
    recordsCount: sheet._count.records,
  }));

  return <DashboardClient sheets={formattedSheets} />;
}
