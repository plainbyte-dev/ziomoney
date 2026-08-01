"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { TransactionDetail, ReportSectionKey } from "@/data/transactionsData";

interface TransactionCardProps {
  transaction: TransactionDetail;
  visibleSections: Record<ReportSectionKey, boolean>;
  defaultOpen?: boolean;
}

export default function TransactionCard({
  transaction,
  visibleSections,
  defaultOpen = false,
}: TransactionCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 bg-white px-5 py-4 text-left"
      >
        <div className="flex min-w-[180px] flex-col gap-1">
          <span className="text-xs text-muted">REF {transaction.refCode}</span>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-heading">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green" />
            {transaction.country}
          </span>
          <span className="text-xs text-muted">via {transaction.via}</span>
        </div>

        <SummaryStat label="COLLECTED" value={transaction.collectedAmount} />
        <SummaryStat label="PAYOUT" value={transaction.payoutAmount} accent="text-brand-blue" />
        <SummaryStat label="SETT. AGENT" value={transaction.settlementAgentAmount} />
        <SummaryStat
          label="SETT. PARTNER"
          value={transaction.settlementPartnerAmount}
          accent="text-brand-green"
        />

        {open ? (
          <ChevronUp size={18} className="shrink-0 text-muted" />
        ) : (
          <ChevronDown size={18} className="shrink-0 text-muted" />
        )}
      </button>

      {open && (
        <div className="grid grid-cols-1 gap-6 border-t border-border bg-surface/60 px-5 py-5 sm:grid-cols-2 lg:grid-cols-5">
          {visibleSections.collection && (
            <DetailColumn title="COLLECTION (CUSTOMER)">
              <DetailRow label="Transfer amount" value={transaction.collection.transferAmount} />
              <DetailRow label="Service charge" value={transaction.collection.serviceCharge} />
              <DetailRow label="Discount" value={transaction.collection.discount} />
              <DetailRow
                label="Collected amount"
                value={transaction.collection.collectedAmount}
                bold
              />
            </DetailColumn>
          )}

          {visibleSections.payout && (
            <DetailColumn title="PAYOUT">
              <DetailRow label="Customer rate" value={transaction.payout.customerRate} />
              <DetailRow
                label="Receive amount"
                value={transaction.payout.receiveAmount}
                bold
                accent="text-brand-blue"
              />
            </DetailColumn>
          )}

          {visibleSections.settlementAgent && (
            <DetailColumn title="SETTLEMENT (AGENT)">
              <DetailRow label="Commission" value={transaction.settlementAgent.commission} />
              <DetailRow label="Exchange rate" value={transaction.settlementAgent.exchangeRate} />
              <DetailRow
                label="Settlement amount"
                value={transaction.settlementAgent.settlementAmount}
                bold
              />
            </DetailColumn>
          )}

          {visibleSections.settlementPartner && (
            <DetailColumn title="SETTLEMENT PARTNER">
              <DetailRow label="Settle rate" value={transaction.settlementPartner.settleRate} />
              <DetailRow label="Principal" value={transaction.settlementPartner.principal} />
              <DetailRow label="Commission" value={transaction.settlementPartner.commission} />
              <DetailRow
                label="Settlement amount"
                value={transaction.settlementPartner.settlementAmount}
                bold
                accent="text-brand-green"
              />
            </DetailColumn>
          )}

          {visibleSections.headOffice && (
            <DetailColumn title="HEAD OFFICE">
              <DetailRow label="Service charge" value={transaction.headOffice.serviceCharge} />
              <DetailRow label="Exchange gain" value={transaction.headOffice.exchangeGain} />
              <DetailRow
                label="Net amount"
                value={transaction.headOffice.netAmount}
                bold
                accent="text-orange-500"
              />
            </DetailColumn>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex min-w-[110px] flex-col gap-1">
      <span className="text-[11px] tracking-wide text-muted">{label}</span>
      <span className={`text-sm font-semibold ${accent ?? "text-heading"}`}>{value}</span>
    </div>
  );
}

function DetailColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold tracking-wide text-muted">{title}</p>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  bold,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  accent?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-xs">
      <span className="text-muted">{label}</span>
      <span
        className={`${bold ? "font-semibold" : ""} ${accent ?? "text-heading"} text-right`}
      >
        {value}
      </span>
    </div>
  );
}
