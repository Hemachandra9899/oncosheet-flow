import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen px-5 py-8 md:px-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-soft">O</div>
          <div>
            <p className="text-sm font-semibold text-slate-950">OncoSheet Flow</p>
            <p className="text-xs text-slate-500">Google Sheets automation</p>
          </div>
        </div>
      </nav>

      <section className="mx-auto mt-16 grid max-w-6xl items-center gap-10 md:grid-cols-[1fr_440px]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 backdrop-blur">
            <Sparkles className="h-4 w-4" /> Click-first patient data entry
          </div>
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-slate-950 md:text-7xl">
            Fill oncology sheets without fighting spreadsheets.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Connect Google Sheets, answer one clean question at a time, auto-calculate BMI, then append the final patient row instantly.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/api/google/start"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Continue with Google <ArrowRight className="h-4 w-4" />
            </a>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white/70 px-5 py-4 text-sm font-medium text-slate-600 ring-1 ring-slate-200">
              <ShieldCheck className="h-4 w-4" /> Your patient rows stay in your Google Sheet
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white/80 p-5 shadow-soft ring-1 ring-white backdrop-blur">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-indigo-100 via-white to-lime-100 p-8">
            <div className="mx-auto min-h-[460px] rounded-[1.4rem] bg-white/90 p-8 shadow-soft ring-1 ring-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 rounded-full bg-indigo-500" />
                <div className="h-2 flex-1 rounded-full bg-slate-200" />
              </div>
              <p className="mt-14 text-xs font-bold uppercase tracking-widest text-slate-400">Question 1</p>
              <h2 className="mt-3 text-2xl font-bold text-slate-950">Patient name</h2>
              <div className="mt-7 rounded-2xl border border-slate-200 bg-white px-4 py-4 font-medium text-slate-700 shadow-sm">Shashidar</div>
              <div className="mt-36 flex items-center justify-end gap-3">
                <span className="text-sm font-semibold text-slate-300">Back</span>
                <span className="rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200">Next</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
