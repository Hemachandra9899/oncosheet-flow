import { redirect } from "next/navigation";
import PatientWizard from "@/components/PatientWizard";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function NewPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getUserIdFromSession();

  if (!userId) {
    redirect("/");
  }

  const connection = await prisma.sheetConnection.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!connection) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-dvh bg-[#F7F5EF] sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-6">
      <div className="w-full sm:max-w-md">
        <PatientWizard sheetId={id} />
      </div>
    </main>
  );
}
