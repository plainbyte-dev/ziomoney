"use client";

import { ChevronDown } from "lucide-react";
import { formatAmount } from "@/lib/format";

interface CreditLimitBannerProps {
  topUpAmount: number;
  topUpCurrency: string;
  countryOptions: string[];
  countryFilter: string;
  onCountryChange: (value: string) => void;
}

export default function CreditLimitBanner({
  topUpAmount,
  topUpCurrency,
  countryOptions,
  countryFilter,
  onCountryChange,
}: CreditLimitBannerProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-border bg-surface px-6 py-3">
      <p className="text-sm font-semibold text-red-700">
        Your credit top-up limit : {formatAmount(topUpAmount)} {topUpCurrency}
      </p>

      <div className="flex items-center gap-2 text-sm">
        <label className="font-semibold text-heading/80">Select Country</label>
        <div className="relative">
          <select
            value={countryFilter}
            onChange={(event) => onCountryChange(event.target.value)}
            className="appearance-none rounded-lg border border-border bg-white px-3 py-1.5 pr-8 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          >
            <option value="ALL">ALL</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
      </div>
    </div>
  );
}