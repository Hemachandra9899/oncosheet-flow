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
      className="group flex min-h-[60px] items-center justify-between rounded-[1.4rem] bg-white px-4 py-4 text-left text-[15px] font-black text-[#071B1A] shadow-sm ring-1 ring-slate-200 transition active:scale-[0.98] hover:bg-[#D7F2F7]"
    >
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#062E2B]" />
    </button>
  );
}
