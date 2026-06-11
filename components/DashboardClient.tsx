"use client";

import { useState } from "react";
import {
  ArrowRight,
  FilePlus2,
  Pencil,
  RefreshCw,
  Sheet,
  Sparkles,
} from "lucide-react";

type DashboardSheet = {
  id: string;
  spreadsheetId: string;
  spreadsheetName: string | null;
  sheetName: string;
  createdAt: string;
  recordsCount: number;
};

const themes = [
  "from-indigo-500 via-violet-500 to-fuchsia-400",
  "from-emerald-500 via-teal-500 to-cyan-400",
  "from-orange-400 via-amber-400 to-lime-300",
  "from-sky-500 via-blue-500 to-indigo-400",
  "from-rose-500 via-pink-500 to-orange-300",
];

export default function DashboardClient({
  sheets,
}: {
  sheets: DashboardSheet[];
}) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("OncoSheet Flow - Patients");
  const [sheetName, setSheetName] = useState("Patients");
  const [error, setError] = useState("");

  async function createSheet() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/sheets/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, sheetName }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Could not create sheet");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <main className="min-h-screen px-5 py-8 md:px-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-soft">
            O
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              OncoSheet Flow
            </p>
            <p className="text-xs text-slate-500">Sheet dashboard</p>
          </div>
        </div>

        <a
          href="/connect"
          className="hidden rounded-2xl bg-white/80 px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-white md:inline-flex"
        >
          Connect existing sheet
        </a>
      </nav>

      <section className="mx-auto mt-10 max-w-6xl">
        <div className="overflow-hidden rounded-[2rem] bg-white/75 p-4 shadow-soft ring-1 ring-white backdrop-blur">
          <div className="rounded-[1.6rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700 p-8 text-white md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/20">
              <Sparkles className="h-4 w-4" />
              Click-first oncology sheets
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-[1fr_380px] md:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                  Manage every patient sheet from one place.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-indigo-100">
                  Create a sheet, choose it from the dashboard, then start the
                  patient flow. The form starts with Patient ID, then Patient
                  Name.
                </p>
              </div>

              <div className="rounded-[1.4rem] bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
                <label className="text-xs font-bold uppercase tracking-widest text-indigo-100">
                  Sheet title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/95 px-4 py-3 text-sm font-bold text-slate-950 outline-none"
                />

                <label className="mt-4 block text-xs font-bold uppercase tracking-widest text-indigo-100">
                  Tab name
                </label>
                <input
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/95 px-4 py-3 text-sm font-bold text-slate-950 outline-none"
                />

                <button
                  onClick={createSheet}
                  disabled={loading}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-black text-slate-950 shadow-lg shadow-indigo-950/20 transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create new sheet"}
                  <FilePlus2 className="h-4 w-4" />
                </button>

                {error ? (
                  <p className="mt-3 rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">
              Generated sheets
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Open a sheet and start appending or updating patient rows.
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-2xl bg-white/80 p-3 text-slate-500 ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900"
          >
            <RefreshCw className="h-4 w-4" />
          </a>
        </div>

        {sheets.length === 0 ? (
          <div className="mt-5 rounded-[1.6rem] bg-white/80 p-8 text-center shadow-soft ring-1 ring-white">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Sheet className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-black text-slate-950">
              No sheets yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Create your first clean patient sheet from the top card.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sheets.map((sheet, index) => (
              <article
                key={sheet.id}
                className="overflow-hidden rounded-[1.7rem] bg-white shadow-soft ring-1 ring-slate-100"
              >
                <div
                  className={`h-24 bg-gradient-to-br ${
                    themes[index % themes.length]
                  } p-5 text-white`}
                >
                  <div className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-widest ring-1 ring-white/20">
                    {sheet.sheetName}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="line-clamp-2 text-xl font-black tracking-tight text-slate-950">
                    {sheet.spreadsheetName || "Untitled patient sheet"}
                  </h3>

                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {sheet.recordsCount} synced patient rows
                  </p>

                  <div className="mt-6 grid gap-3">
                    <a
                      href={`/sheet/${sheet.id}/new`}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-slate-800"
                    >
                      Start patient flow
                      <ArrowRight className="h-4 w-4" />
                    </a>

                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href={`https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}/edit`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        <Sheet className="h-4 w-4" />
                        Open
                      </a>

                      <a
                        href={`/sheet/${sheet.id}/new`}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
