import { ArrowRight } from "lucide-react";

export function OptionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[58px] items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-[15px] font-black text-slate-800 shadow-sm transition active:scale-[0.98] hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
    >
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-indigo-500" />
    </button>
  );
}
