import PatientWizard from "@/components/PatientWizard";

export default function NewPatientPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-8">
      <div className="w-full max-w-6xl rounded-[2rem] bg-white/70 p-4 shadow-soft ring-1 ring-white backdrop-blur">
        <div className="flex min-h-[720px] items-center justify-center rounded-[1.6rem] bg-gradient-to-br from-indigo-100 via-white to-lime-100 p-6">
          <PatientWizard sheetId={params.id} />
        </div>
      </div>
    </main>
  );
}
