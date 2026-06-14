"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { calculateBMI, getBMIGroup } from "@/lib/bmi";
import type { TemplateColumn, TemplateStep } from "@/lib/templates";
import { OptionButton } from "./OptionButton";

function FieldShell({ children }: { children: React.ReactNode }) {
  return <div className="mt-7 space-y-4">{children}</div>;
}

export default function PatientWizard({
  sheetId,
  templateKey,
  templateName,
  steps,
  columns,
}: {
  sheetId: string;
  templateKey: string;
  templateName: string;
  steps: TemplateStep[];
  columns: TemplateColumn[];
}) {
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<Record<string, any>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"append" | "update">("append");

  const step = steps[index];
  const progress = Math.round(((index + 1) / steps.length) * 100);

  const preBmi = useMemo(
    () => calculateBMI(Number(values.weightKg), Number(values.height)),
    [values.weightKg, values.height]
  );

  function update(key: string, value: any) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setError("");
    setIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function back() {
    setError("");
    setIndex((prev) => Math.max(prev - 1, 0));
  }

  function choose(key: string, value: string) {
    update(key, value);

    if (value === "Other") {
      return;
    }

    window.setTimeout(next, 120);
  }

  async function submit() {
    if (mode === "update") {
      setError("Update existing row is coming next. For now, use Append new row.");
      setSubmitting(false);
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/sheets/${sheetId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return setError(data.error || "Could not submit row");
    setIndex(0);
    setValues({});
    alert("Patient row added to Google Sheet.");
  }

  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#F7F5EF] px-4 py-5 text-[#071B1A] shadow-none sm:min-h-0 sm:rounded-[2rem] sm:bg-white sm:p-6 sm:shadow-sm sm:ring-1 sm:ring-slate-200">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-[#062E2B] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <button className="rounded-full bg-slate-100 p-2 text-slate-400 hover:text-slate-700" type="button" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-8 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:mt-10">
        Question {index + 1} &middot; {step.label}
      </p>
      <h1 className="mt-2 text-[2.2rem] font-black leading-[0.95] tracking-[-0.05em] text-[#07071E] sm:text-4xl">
        {step.title}
      </h1>

      {step.type === "text" || step.type === "number" || step.type === "date" ? (
        <FieldShell>
          <input
            type={step.type === "number" ? "number" : step.type === "date" ? "date" : "text"}
            value={values[step.id] || ""}
            onChange={(e) => update(step.id, e.target.value)}
            placeholder={step.placeholder}
            className="focus-ring w-full rounded-[1.4rem] border-0 bg-white px-4 py-5 text-[16px] font-black text-slate-900 shadow-sm outline-none ring-1 ring-slate-200"
          />
        </FieldShell>
      ) : null}

      {step.type === "textarea" ? (
        <FieldShell>
          <textarea
            value={values[step.id] || ""}
            onChange={(e) => update(step.id, e.target.value)}
            placeholder={step.placeholder}
            rows={5}
            className="focus-ring w-full resize-none rounded-[1.4rem] border-0 bg-white px-4 py-5 text-[16px] font-black text-slate-900 shadow-sm outline-none ring-1 ring-slate-200"
          />
        </FieldShell>
      ) : null}

      {step.type === "choice" ? (
        <FieldShell>
          <div className="grid grid-cols-2 gap-3">
            {step.options.map((option) => (
              <OptionButton key={option} label={option} onClick={() => choose(step.id, option)} />
            ))}
          </div>
          {values[step.id] === "Other" ? (
            <input
              autoFocus
              placeholder="Type custom value"
              className="focus-ring w-full rounded-[1.4rem] border-0 bg-white px-4 py-5 text-[16px] font-black text-slate-900 shadow-sm outline-none ring-1 ring-slate-200"
              onChange={(e) => update(step.id, e.target.value)}
            />
          ) : null}
        </FieldShell>
      ) : null}

      {step.type === "grade" ? (
        <FieldShell>
          <div className="grid grid-cols-2 gap-3">
            {["Grade 0", "Grade 1", "Grade 2", "Grade 3", "NA"].map((option) => (
              <OptionButton key={option} label={option} onClick={() => choose(step.id, option)} />
            ))}
          </div>
        </FieldShell>
      ) : null}

      {step.type === "preBmi" ? (
        <FieldShell>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={values.weightKg || ""}
              onChange={(e) => update("weightKg", e.target.value)}
              placeholder="Weight kg"
              className="focus-ring rounded-[1.4rem] border-0 bg-white px-4 py-5 text-[16px] font-black text-slate-900 shadow-sm outline-none ring-1 ring-slate-200"
            />
            <input
              type="number"
              value={values.height || ""}
              onChange={(e) => update("height", e.target.value)}
              placeholder="Height cm"
              className="focus-ring rounded-[1.4rem] border-0 bg-white px-4 py-5 text-[16px] font-black text-slate-900 shadow-sm outline-none ring-1 ring-slate-200"
            />
          </div>
          <div className="rounded-[1.4rem] bg-white p-4 ring-1 ring-indigo-100">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Auto calculated</p>
            <p className="mt-2 text-2xl font-bold text-indigo-700">BMI: {preBmi ?? "—"}</p>
            <p className="mt-1 text-sm font-semibold text-indigo-600">{getBMIGroup(preBmi)}</p>
          </div>
        </FieldShell>
      ) : null}

      {step.type === "review" ? (
        <FieldShell>
          <div className="max-h-72 overflow-auto rounded-[1.4rem] bg-white p-4 ring-1 ring-slate-200">
            <dl className="space-y-3 text-sm">
              {columns
                .filter((column) => column.key !== "serialNo")
                .map((column) => (
                  <div key={column.key} className="flex justify-between gap-4 border-b border-slate-200/70 pb-2 last:border-b-0">
                    <dt className="font-semibold text-slate-500">{column.label}</dt>
                    <dd className="text-right font-bold text-slate-900">
                      {String(values[column.key] ?? "—")}
                    </dd>
                  </div>
                ))}
              {templateKey === "oncology_rt" ? (
                <>
                  <div className="flex justify-between gap-4 border-b border-slate-200/70 pb-2">
                    <dt className="font-semibold text-slate-500">Pre RT BMI</dt>
                    <dd className="text-right font-bold text-slate-900">{preBmi ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-slate-200/70 pb-2">
                    <dt className="font-semibold text-slate-500">BMI Group</dt>
                    <dd className="text-right font-bold text-slate-900">{getBMIGroup(preBmi) || "—"}</dd>
                  </div>
                </>
              ) : null}
            </dl>
          </div>
        </FieldShell>
      ) : null}

      {step.type === "review" ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("append")}
            className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
              mode === "append"
                ? "bg-slate-950 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Append new row
          </button>
          <button
            type="button"
            onClick={() => setMode("update")}
            className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
              mode === "update"
                ? "bg-indigo-600 text-white"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            Update existing
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="sticky bottom-0 -mx-4 mt-auto flex items-center justify-between border-t border-slate-200 bg-[#F7F5EF]/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:mt-10 sm:border-t-0 sm:bg-transparent sm:px-0 sm:py-0">
        <button
          type="button"
          onClick={back}
          disabled={index === 0}
          className="inline-flex min-h-[52px] items-center gap-2 rounded-full px-4 text-sm font-black text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {step.type === "review" ? (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex min-h-[56px] items-center gap-2 rounded-full bg-emerald-600 px-8 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit"} <Check className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="inline-flex min-h-[56px] items-center gap-2 rounded-full bg-[#062E2B] px-8 text-sm font-black text-white shadow-sm transition active:scale-[0.98]"
          >
            Next <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
