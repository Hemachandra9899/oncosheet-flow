export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { getUserIdFromSession } from "@/lib/session";

export default async function HomePage() {
  const userId = await getUserIdFromSession();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-dvh bg-[#F7F5EF] px-4 py-5 text-[#071B1A] sm:px-8 sm:py-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#062E2B] text-sm font-black text-white">
            O
          </div>
          <div>
            <p className="text-base font-black tracking-tight">OpenSheet</p>
            <p className="text-xs font-semibold text-slate-500">
              Sheets automation
            </p>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-8 pt-12 sm:pt-16 lg:grid-cols-[1fr_430px] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">
            <Sparkles className="h-4 w-4" />
            Click-first data entry
          </div>

          <h1 className="mt-6 max-w-3xl text-[4.2rem] font-black leading-[0.88] tracking-[-0.07em] text-[#07071E] sm:text-7xl lg:text-8xl">
            Always keep sheets clean.
          </h1>

          <p className="mt-6 max-w-xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
            Connect Google Sheets, fill one clean step at a time, review every
            value, and append the final row safely.
          </p>

          <div className="mt-8 grid gap-3 sm:max-w-sm">
            <a
              href="/api/google/start"
              className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-full bg-[#062E2B] px-6 py-4 text-sm font-black text-white shadow-lg shadow-emerald-950/10 transition active:scale-[0.98]"
            >
              Continue with Google
              <ArrowRight className="h-4 w-4" />
            </a>

            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-4 text-sm font-bold text-slate-600 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Rows stay in your Google Sheet
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-[#BDEAF3] p-4 shadow-sm">
          <div className="rounded-[1.6rem] bg-white/90 p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-20 rounded-full bg-[#062E2B]" />
              <div className="h-2 flex-1 rounded-full bg-slate-200" />
            </div>

            <p className="mt-14 text-xs font-black uppercase tracking-widest text-slate-400">
              Question 1
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">
              Patient ID
            </h2>

            <div className="mt-7 rounded-3xl bg-white px-5 py-5 text-[16px] font-black text-slate-700 shadow-sm ring-1 ring-slate-200">
              25-05976
            </div>

            <div className="mt-32 flex justify-end">
              <span className="rounded-full bg-[#062E2B] px-8 py-4 text-sm font-black text-white">
                Next
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
