"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { calculateBMI, getBMIGroup } from "@/lib/bmi";
import { OptionButton } from "./OptionButton";

type Step =
  | { id: string; label: string; title: string; type: "text" | "number" | "date" | "textarea"; placeholder?: string }
  | { id: string; label: string; title: string; type: "choice"; options: string[] }
  | { id: string; label: string; title: string; type: "grade" }
  | { id: string; label: string; title: string; type: "preBmi" | "postBmi" }
  | { id: string; label: string; title: string; type: "review" };

const steps: Step[] = [
  { id: "patientName", label: "Patient", title: "Patient name", type: "text", placeholder: "Enter patient name" },
  { id: "patientId", label: "Patient", title: "Patient ID", type: "text", placeholder: "25-05976" },
  { id: "age", label: "Patient", title: "Age", type: "number", placeholder: "50" },
  { id: "sex", label: "Patient", title: "Sex", type: "choice", options: ["Male", "Female"] },
  { id: "primarySite", label: "Diagnosis", title: "Primary site", type: "choice", options: ["Ca Hypopharynx", "Ca Tongue", "Ca Bm", "Ca Oropharynx", "Ca Nasopharynx", "Ca Post Cricoid", "Other"] },
  { id: "stage", label: "Diagnosis", title: "Stage", type: "text", placeholder: "T2N2M0" },
  { id: "ecog", label: "Diagnosis", title: "ECOG", type: "choice", options: ["0", "1", "2", "3", "4"] },
  { id: "preBmi", label: "Pre RT", title: "Pre RT weight, height and BMI", type: "preBmi" },
  { id: "rtStarted", label: "RT", title: "RT started", type: "date" },
  { id: "rtDoseGy", label: "RT", title: "RT dose", type: "choice", options: ["66gy 33#", "60gy 30#", "70gy 35#", "68gy 34#", "Other"] },
  { id: "rtTech", label: "RT", title: "RT technique", type: "choice", options: ["IMRT", "RADICAL RT", "ADJRT IMRT", "Other"] },
  { id: "rtEnded", label: "RT", title: "RT ended", type: "date" },
  { id: "cctCycles", label: "Treatment", title: "CCT cycles", type: "text", placeholder: "3 cisplatin" },
  { id: "ryles", label: "Treatment", title: "Ryles", type: "choice", options: ["Yes", "No"] },
  { id: "postRtMucositis", label: "Toxicity", title: "Post RT mucositis", type: "grade" },
  { id: "postRtDermatitis", label: "Toxicity", title: "Post RT dermatitis", type: "grade" },
  { id: "postRtDys", label: "Toxicity", title: "Post RT dysphagia", type: "grade" },
  { id: "postBmi", label: "Post RT", title: "Post RT weight and BMI", type: "postBmi" },
  { id: "treatmentInterruptions", label: "Final", title: "Treatment interruptions", type: "choice", options: ["Yes", "No"] },
  { id: "notes", label: "Final", title: "Notes", type: "textarea", placeholder: "Optional notes" },
  { id: "review", label: "Review", title: "Review patient row", type: "review" }
];

function FieldShell({ children }: { children: React.ReactNode }) {
  return <div className="mt-7 space-y-4">{children}</div>;
}

export default function PatientWizard({ sheetId }: { sheetId: string }) {
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<Record<string, any>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const step = steps[index];
  const progress = Math.round(((index + 1) / steps.length) * 100);

  const preBmi = useMemo(
    () => calculateBMI(Number(values.preRtWeightKg), Number(values.heightCm)),
    [values.preRtWeightKg, values.heightCm]
  );
  const postBmi = useMemo(
    () => calculateBMI(Number(values.postRtWeightKg), Number(values.heightCm)),
    [values.postRtWeightKg, values.heightCm]
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
    window.setTimeout(next, 120);
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/sheets/${sheetId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) return setError(data.error || "Could not submit row");
    setIndex(0);
    setValues({});
    alert("Patient row added to Google Sheet.");
  }

  return (
    <div className="w-full max-w-[460px] rounded-[1.4rem] bg-white/95 p-7 shadow-soft ring-1 ring-slate-100 md:p-8">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <button className="rounded-full bg-slate-100 p-2 text-slate-400 hover:text-slate-700" type="button" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-12 text-xs font-bold uppercase tracking-widest text-slate-400">
        Question {index + 1} · {step.label}
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{step.title}</h1>

      {step.type === "text" || step.type === "number" || step.type === "date" ? (
        <FieldShell>
          <input
            type={step.type === "number" ? "number" : step.type === "date" ? "date" : "text"}
            value={values[step.id] || ""}
            onChange={(e) => update(step.id, e.target.value)}
            placeholder={step.placeholder}
            className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 shadow-sm"
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
            className="focus-ring w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 shadow-sm"
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
              className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 shadow-sm"
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
              value={values.preRtWeightKg || ""}
              onChange={(e) => update("preRtWeightKg", e.target.value)}
              placeholder="Weight kg"
              className="focus-ring rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 shadow-sm"
            />
            <input
              type="number"
              value={values.heightCm || ""}
              onChange={(e) => update("heightCm", e.target.value)}
              placeholder="Height cm"
              className="focus-ring rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 shadow-sm"
            />
          </div>
          <div className="rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">Auto calculated</p>
            <p className="mt-2 text-2xl font-bold text-indigo-700">BMI: {preBmi ?? "—"}</p>
            <p className="mt-1 text-sm font-semibold text-indigo-600">{getBMIGroup(preBmi)}</p>
          </div>
        </FieldShell>
      ) : null}

      {step.type === "postBmi" ? (
        <FieldShell>
          <input
            type="number"
            value={values.postRtWeightKg || ""}
            onChange={(e) => update("postRtWeightKg", e.target.value)}
            placeholder="Post RT weight kg"
            className="focus-ring w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 shadow-sm"
          />
          <div className="rounded-2xl bg-lime-50 p-4 ring-1 ring-lime-100">
            <p className="text-xs font-bold uppercase tracking-widest text-lime-600">Auto calculated</p>
            <p className="mt-2 text-2xl font-bold text-lime-700">Post RT BMI: {postBmi ?? "—"}</p>
          </div>
        </FieldShell>
      ) : null}

      {step.type === "review" ? (
        <FieldShell>
          <div className="max-h-72 overflow-auto rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <dl className="space-y-3 text-sm">
              {Object.entries(values).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 border-b border-slate-200/70 pb-2 last:border-b-0">
                  <dt className="font-semibold text-slate-500">{key}</dt>
                  <dd className="text-right font-bold text-slate-900">{String(value || "—")}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 border-b border-slate-200/70 pb-2">
                <dt className="font-semibold text-slate-500">Pre RT BMI</dt>
                <dd className="text-right font-bold text-slate-900">{preBmi ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-slate-500">Post RT BMI</dt>
                <dd className="text-right font-bold text-slate-900">{postBmi ?? "—"}</dd>
              </div>
            </dl>
          </div>
        </FieldShell>
      ) : null}

      {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="mt-12 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={index === 0}
          className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {step.type === "review" ? (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-500 disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit"} <Check className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-500"
          >
            Next <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
