import type { CancelledTransaction } from "@/data/transactionsData";

export default function CancelledTransactionCard({
  transaction,
}: {
  transaction: CancelledTransaction;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-white px-5 py-4">
      <div className="flex min-w-[200px] flex-col gap-1 border-l-2 border-red-400 pl-3">
        <span className="text-xs text-muted">REF {transaction.refCode}</span>
        <span className="text-sm font-semibold text-heading">{transaction.country}</span>
        <span className="text-xs text-muted">{transaction.via}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] tracking-wide text-muted">COLLECTED</span>
        <span className="text-sm font-semibold text-heading">
          {transaction.collectedAmount}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] tracking-wide text-muted">WOULD-BE PAYOUT</span>
        <span className="text-sm font-semibold text-brand-blue">
          {transaction.worldRePayoutAmount}
        </span>
      </div>

      <div className="flex flex-col items-end gap-1">
        <span className="text-[11px] tracking-wide text-muted">STATUS</span>
        <span className="text-sm font-semibold text-red-500">{transaction.status}</span>
      </div>
    </div>
  );
}
