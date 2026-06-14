"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, X } from "lucide-react";
import { calculateBMI, getBMIGroup } from "@/lib/bmi";

type FlowStep =
  | {
      id: string;
      header: string;
      label: string;
      title: string;
      type: "text" | "number" | "date" | "textarea" | "choice";
      options?: string[];
      placeholder?: string;
    }
  | {
      id: "review";
      label: "Review";
      title: "Review row before submit";
      type: "review";
    };

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").replace(/\s*:\s*$/g, "").trim();
}

function shouldSkipHeader(header: string) {
  const value = normalize(header);

  return (
    !value ||
    value === "s.no" ||
    value === "s no" ||
    value === "sno" ||
    value === "pre rt bmi" ||
    value === "bmi group"
  );
}

function inferStepType(header: string): FlowStep["type"] {
  const value = normalize(header);

  if (
    value.includes("date") ||
    value.includes("started") ||
    value.includes("ended")
  ) {
    return "date";
  }

  if (
    value === "age" ||
    value.includes("weight") ||
    value.includes("height") ||
    value.includes("volume") ||
    value === "ecog"
  ) {
    return "number";
  }

  if (
    value.includes("notes") ||
    value.includes("ihc") ||
    value.includes("prescription") ||
    value.includes("displacement")
  ) {
    return "textarea";
  }

  if (
    value === "ryles" ||
    value.includes("interruptions") ||
    value.includes("interruption")
  ) {
    return "choice";
  }

  return "text";
}

function inferOptions(header: string) {
  const value = normalize(header);

  if (
    value === "ryles" ||
    value.includes("interruptions") ||
    value.includes("interruption")
  ) {
    return ["Yes", "No"];
  }

  return undefined;
}

function findHeader(headers: string[], candidates: string[]) {
  const normalizedCandidates = candidates.map(normalize);
  return headers.find((header) => normalizedCandidates.includes(normalize(header)));
}

function FieldShell({ children }: { children: React.ReactNode }) {
  return <div className="mt-7 space-y-4">{children}</div>;
}

export default function PatientWizard({ sheetId }: { sheetId: string }) {
  const [index, setIndex] = useState(0);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rowValues, setRowValues] = useState<Record<string, any>>({});
  const [loadingHeaders, setLoadingHeaders] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadHeaders() {
      setLoadingHeaders(true);
      setError("");

      const res = await fetch(`/api/sheets/${sheetId}/headers`);
      const data = await res.json();

      setLoadingHeaders(false);

      if (!res.ok) {
        setError(data.error || "Could not load sheet columns");
        return;
      }

      setHeaders(data.headers || []);
    }

    loadHeaders();
  }, [sheetId]);

  const steps = useMemo<FlowStep[]>(() => {
    const fieldSteps = headers
      .filter((header) => !shouldSkipHeader(header))
      .map((header) => {
        const rawHeader = header;
        const displayHeader = header.replace(/\s+/g, " ").trim();
        const type = inferStepType(displayHeader);
        const options = inferOptions(displayHeader);

        return {
          id: `field:${rawHeader}`,
          header: rawHeader,
          label: "Sheet Column",
          title: displayHeader,
          type,
          options,
          placeholder: `Enter ${displayHeader}`,
        } as FlowStep;
      });

    return [
      ...fieldSteps,
      {
        id: "review",
        label: "Review",
        title: "Review row before submit",
        type: "review",
      },
    ];
  }, [headers]);

  const step = steps[index];
  const progress = steps.length
    ? Math.round(((index + 1) / steps.length) * 100)
    : 0;

  const weightHeader = useMemo(
    () =>
      findHeader(headers, [
        "Weight(kg)",
        "Pre RT Weight(kg)",
        "Pre RT Weight(k",
        "Weight",
      ]),
    [headers]
  );

  const heightHeader = useMemo(
    () => findHeader(headers, ["Height(m)", "Height(cm)", "Height"]),
    [headers]
  );

  const preBmi = useMemo(() => {
    if (!weightHeader || !heightHeader) return null;

    return calculateBMI(
      Number(rowValues[weightHeader]),
      Number(rowValues[heightHeader])
    );
  }, [rowValues, weightHeader, heightHeader]);

  function update(header: string, value: any) {
    setRowValues((prev) => ({
      ...prev,
      [header]: value,
    }));
  }

  function next() {
    setError("");
    setIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function back() {
    setError("");
    setIndex((prev) => Math.max(prev - 1, 0));
  }

  async function submit() {
    const finalValues = {
      ...rowValues,
    };

    const preBmiHeader = findHeader(headers, ["Pre RT BMI"]);
    const bmiGroupHeader = findHeader(headers, ["BMI Group"]);

    if (preBmiHeader && preBmi != null) {
      finalValues[preBmiHeader] = preBmi;
    }

    if (bmiGroupHeader && preBmi != null) {
      finalValues[bmiGroupHeader] = getBMIGroup(preBmi);
    }

    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/sheets/${sheetId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rowValues: finalValues,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Could not submit row");
      return;
    }

    setIndex(0);
    setRowValues({});
    alert("Row added to Google Sheet.");
  }

  if (loadingHeaders) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-[#F7F5EF] px-4 text-center sm:min-h-[520px] sm:rounded-[2rem] sm:bg-white sm:shadow-sm sm:ring-1 sm:ring-slate-200">
        <Loader2 className="h-6 w-6 animate-spin text-[#062E2B]" />
        <p className="mt-4 text-sm font-black text-slate-600">
          Loading sheet columns...
        </p>
      </div>
    );
  }

  if (!step) {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center bg-[#F7F5EF] px-4 text-center sm:min-h-[520px] sm:rounded-[2rem] sm:bg-white sm:shadow-sm sm:ring-1 sm:ring-slate-200">
        <p className="text-lg font-black text-slate-900">
          No columns found in this sheet.
        </p>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Add headers in row 1 of Google Sheet first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#F7F5EF] px-4 py-5 text-[#071B1A] shadow-none sm:min-h-0 sm:rounded-[2rem] sm:bg-white sm:p-6 sm:shadow-sm sm:ring-1 sm:ring-slate-200">
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#062E2B] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <a
          href="/dashboard"
          className="rounded-full bg-white p-2 text-slate-400 shadow-sm ring-1 ring-slate-200 hover:text-slate-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </a>
      </div>

      <p className="mt-8 text-[11px] font-black uppercase tracking-widest text-slate-400 sm:mt-10">
        Question {index + 1} &middot; {step.label}
      </p>

      <h1 className="mt-2 text-[2.2rem] font-black leading-[0.95] tracking-[-0.05em] text-[#07071E] sm:text-4xl">
        {step.title}
      </h1>

      {step.type === "text" || step.type === "number" || step.type === "date" ? (
        <FieldShell>
          <input
            type={
              step.type === "number"
                ? "number"
                : step.type === "date"
                  ? "date"
                  : "text"
            }
            value={rowValues[step.header] || ""}
            onChange={(e) => update(step.header, e.target.value)}
            placeholder={step.placeholder}
            className="w-full rounded-[1.4rem] border-0 bg-white px-4 py-5 text-[16px] font-black text-slate-900 shadow-sm outline-none ring-1 ring-slate-200"
          />
        </FieldShell>
      ) : null}

      {step.type === "textarea" ? (
        <FieldShell>
          <textarea
            value={rowValues[step.header] || ""}
            onChange={(e) => update(step.header, e.target.value)}
            placeholder={step.placeholder}
            rows={5}
            className="w-full resize-none rounded-[1.4rem] border-0 bg-white px-4 py-5 text-[16px] font-black text-slate-900 shadow-sm outline-none ring-1 ring-slate-200"
          />
        </FieldShell>
      ) : null}

      {step.type === "choice" ? (
        <FieldShell>
          <div className="grid grid-cols-2 gap-3">
            {(step.options || []).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  update(step.header, option);
                  window.setTimeout(next, 120);
                }}
                className="min-h-[58px] rounded-[1.4rem] bg-white px-4 py-4 text-left text-[15px] font-black text-slate-900 shadow-sm ring-1 ring-slate-200 active:scale-[0.98]"
              >
                {option}
              </button>
            ))}
          </div>
        </FieldShell>
      ) : null}

      {step.type === "review" ? (
        <FieldShell>
          <div className="max-h-[55vh] overflow-auto rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <dl className="space-y-3 text-sm">
              {headers
                .filter((header) => normalize(header) !== "s.no")
                .filter((header) => normalize(header) !== "s no")
                .filter((header) => normalize(header) !== "sno")
                .map((header) => {
                  let value = rowValues[header];

                  if (normalize(header) === "pre rt bmi") {
                    value = preBmi ?? "";
                  }

                  if (normalize(header) === "bmi group") {
                    value = preBmi != null ? getBMIGroup(preBmi) : "";
                  }

                  return (
                    <div
                      key={header}
                      className="flex justify-between gap-4 border-b border-slate-200/70 pb-2 last:border-b-0"
                    >
                      <dt className="font-semibold text-slate-500">{header}</dt>
                      <dd className="text-right font-bold text-slate-900">
                        {String(value || "—")}
                      </dd>
                    </div>
                  );
                })}
            </dl>
          </div>
        </FieldShell>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="sticky bottom-0 -mx-4 mt-auto flex items-center justify-between border-t border-slate-200 bg-[#F7F5EF]/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:mt-10 sm:border-t-0 sm:bg-transparent sm:px-0 sm:py-0">
        <button
          type="button"
          onClick={back}
          disabled={index === 0}
          className="inline-flex min-h-[52px] items-center gap-2 rounded-full px-4 text-sm font-black text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {step.type === "review" ? (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="inline-flex min-h-[56px] items-center gap-2 rounded-full bg-[#062E2B] px-8 text-sm font-black text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Append row"}
            <Check className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="inline-flex min-h-[56px] items-center gap-2 rounded-full bg-[#062E2B] px-8 text-sm font-black text-white shadow-sm transition active:scale-[0.98]"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
