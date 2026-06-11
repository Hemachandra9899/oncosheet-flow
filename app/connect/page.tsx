"use client";

import { useState } from "react";
import { ArrowRight, FilePlus2, Link2 } from "lucide-react";

export default function ConnectPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  async function createSheet() {
    setLoading("create");
    setError("");
    const res = await fetch("/api/sheets/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "OncoSheet Flow - Patients", sheetName: "Patients" })
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) return setError(data.error || "Could not create sheet");
    window.location.href = `/sheet/${data.sheetId}/new`;
  }

  async function connectExisting() {
    if (!url.trim()) return setError("Paste a Google Sheet URL first.");
    setLoading("connect");
    setError("");
    const res = await fetch("/api/sheets/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spreadsheetUrl: url })
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) return setError(data.error || "Could not connect sheet");
    window.location.href = `/sheet/${data.sheetId}/new`;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-8">
      <div className="w-full max-w-5xl rounded-[2rem] bg-white/70 p-4 shadow-soft ring-1 ring-white backdrop-blur">
        <div className="grid gap-4 rounded-[1.6rem] bg-gradient-to-br from-indigo-100 via-white to-lime-100 p-6 md:grid-cols-2 md:p-10">
          <section className="rounded-[1.4rem] bg-white/90 p-8 shadow-soft ring-1 ring-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-950">Create a clean patient sheet</h1>
            <p className="mt-3 text-slate-600">Best for a new client. We create headers, BMI columns, and the patient entry workflow.</p>
            <button
              onClick={createSheet}
              disabled={loading !== null}
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading === "create" ? "Creating..." : "Create new sheet"} <ArrowRight className="h-4 w-4" />
            </button>
          </section>

          <section className="rounded-[1.4rem] bg-white/90 p-8 shadow-soft ring-1 ring-slate-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white">
              <Link2 className="h-5 w-5" />
            </div>
            <h2 className="mt-8 text-3xl font-bold tracking-tight text-slate-950">Connect existing sheet</h2>
            <p className="mt-3 text-slate-600">Paste the Google Sheet URL. We clean headers and add missing columns.</p>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="focus-ring mt-8 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-medium text-slate-900 shadow-sm"
            />
            <button
              onClick={connectExisting}
              disabled={loading !== null}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
            >
              {loading === "connect" ? "Connecting..." : "Connect sheet"} <ArrowRight className="h-4 w-4" />
            </button>
            {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
          </section>
        </div>
      </div>
    </main>
  );
}
