"use client";

import { useState } from "react";
import {
  ArrowRight,
  FilePlus2,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Sheet,
} from "lucide-react";

type DashboardSheet = {
  id: string;
  spreadsheetId: string;
  spreadsheetName: string | null;
  sheetName: string;
  createdAt: string;
  recordsCount: number;
};

const cardThemes = [
  "bg-[#D9C6FF]",
  "bg-[#BDEAF3]",
  "bg-[#FFC8CB]",
  "bg-[#D7F5C5]",
  "bg-[#FFE1A8]",
];

export default function DashboardClient({
  sheets,
}: {
  sheets: DashboardSheet[];
}) {
  const [loading, setLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [title, setTitle] = useState("Oncology RT Patient Report");
  const [sheetName, setSheetName] = useState("Patients");
  const [existingUrl, setExistingUrl] = useState("");
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

  async function connectExistingSheet() {
    if (!existingUrl.trim()) {
      setError("Paste a Google Sheet URL first.");
      return;
    }

    setConnectLoading(true);
    setError("");

    const res = await fetch("/api/sheets/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        spreadsheetUrl: existingUrl,
      }),
    });

    const data = await res.json();
    setConnectLoading(false);

    if (!res.ok) {
      setError(data.error || "Could not connect existing sheet");
      return;
    }

    window.location.href = "/dashboard";
  }

  async function logout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    window.location.href = "/";
  }

  return (
    <main className="min-h-dvh bg-[#F7F5EF] px-4 py-4 text-[#071B1A] sm:px-8 sm:py-7">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#062E2B] text-sm font-black text-white">
            O
          </div>
          <div>
            <p className="text-base font-black tracking-tight">OpenSheet</p>
            <p className="text-xs font-semibold text-slate-500">
              Dashboard
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </nav>

      <section className="mx-auto mt-8 max-w-6xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="max-w-xl text-[3.8rem] font-black leading-[0.88] tracking-[-0.07em] text-[#07071E] sm:text-7xl">
              Your sheets
            </h1>
            <p className="mt-4 max-w-lg text-sm font-semibold leading-6 text-slate-500 sm:text-base">
              Create a new template sheet or connect an existing Google Sheet.
              Then append patient rows safely.
            </p>
          </div>

          <button
            onClick={createSheet}
            disabled={loading}
            className="hidden min-h-[54px] items-center gap-2 rounded-full bg-[#062E2B] px-5 text-sm font-black text-white shadow-sm active:scale-[0.98] sm:inline-flex"
          >
            {loading ? "Creating..." : "Add new sheet"}
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-[380px_1fr]">
          <div className="rounded-[2rem] bg-[#BDEAF3] p-4 shadow-sm">
            <div className="rounded-[1.6rem] bg-white/80 p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-black">Google Spreadsheet</p>
                <div className="rounded-full bg-[#D7F2F7] p-3">
                  <Sheet className="h-5 w-5 text-[#062E2B]" />
                </div>
              </div>

              <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Create new template
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sheet title"
                className="mt-3 w-full rounded-[1.2rem] border-0 bg-white px-4 py-4 text-[16px] font-black text-slate-950 shadow-sm outline-none ring-1 ring-slate-200"
              />

              <input
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="Tab name"
                className="mt-3 w-full rounded-[1.2rem] border-0 bg-white px-4 py-4 text-[16px] font-black text-slate-950 shadow-sm outline-none ring-1 ring-slate-200"
              />

              <button
                onClick={createSheet}
                disabled={loading}
                className="mt-3 inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-[#062E2B] px-5 text-sm font-black text-white shadow-sm active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create sheet"}
                <FilePlus2 className="h-4 w-4" />
              </button>

              <div className="my-6 h-px bg-slate-200" />

              <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Connect existing sheet
              </label>

              <input
                value={existingUrl}
                onChange={(e) => setExistingUrl(e.target.value)}
                placeholder="Paste Google Sheet URL"
                className="mt-3 w-full rounded-[1.2rem] border-0 bg-white px-4 py-4 text-[16px] font-black text-slate-950 shadow-sm outline-none ring-1 ring-slate-200"
              />

              <button
                onClick={connectExistingSheet}
                disabled={connectLoading}
                className="mt-3 inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-[#D9C6FF] px-5 text-sm font-black text-[#07071E] shadow-sm active:scale-[0.98] disabled:opacity-60"
              >
                {connectLoading ? "Connecting..." : "Connect sheet"}
                <ArrowRight className="h-4 w-4" />
              </button>

              {error ? (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-h-[52px] flex-1 items-center gap-3 rounded-full bg-white px-4 shadow-sm ring-1 ring-slate-200">
                <Search className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-400">
                  Search sheets
                </span>
              </div>

              <a
                href="/dashboard"
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200"
              >
                <RefreshCw className="h-4 w-4 text-slate-500" />
              </a>
            </div>

            {sheets.length === 0 ? (
              <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#D7F2F7] text-[#062E2B]">
                  <Sheet className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-black">No sheets yet</h3>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Create or connect your first sheet.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {sheets.map((sheet, index) => (
                  <article
                    key={sheet.id}
                    className={`${cardThemes[index % cardThemes.length]} overflow-hidden rounded-[2rem] p-5 shadow-sm`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="rounded-full bg-white/40 px-3 py-1 text-xs font-black uppercase tracking-widest">
                        {sheet.sheetName}
                      </div>
                      <Sheet className="h-5 w-5" />
                    </div>

                    <h3 className="mt-14 line-clamp-2 text-3xl font-black leading-none tracking-[-0.04em] text-[#07071E]">
                      {sheet.spreadsheetName || "Untitled sheet"}
                    </h3>

                    <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-500">
                      {sheet.recordsCount} synced rows
                    </p>

                    <div className="mt-7 grid gap-3">
                      <a
                        href={`/sheet/${sheet.id}/new`}
                        className="inline-flex min-h-[56px] w-full items-center justify-center rounded-full bg-[#062E2B] px-5 text-sm font-black text-white active:scale-[0.98]"
                      >
                        Start patient flow
                      </a>

                      <div className="grid grid-cols-2 gap-3">
                        <a
                          href={`https://docs.google.com/spreadsheets/d/${sheet.spreadsheetId}/edit`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-white/70 px-4 text-sm font-black text-[#07071E]"
                        >
                          Open
                        </a>

                        <a
                          href={`/sheet/${sheet.id}/new`}
                          className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-white/70 px-4 text-sm font-black text-[#07071E]"
                        >
                          Edit
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
