import PatientWizard from "@/components/PatientWizard";

export default async function NewPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-lime-50 sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-6">
      <div className="w-full sm:max-w-md">
        <PatientWizard sheetId={id} />
      </div>
    </main>
  );
}
