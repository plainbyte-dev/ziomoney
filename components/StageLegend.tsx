import { stageLegend } from "@/data/transactionsData";

export default function StageLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 py-3 text-xs text-heading/70">
      {stageLegend.map((stage) => (
        <span key={stage.label} className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${stage.color}`} />
          {stage.label}
        </span>
      ))}
    </div>
  );
}
