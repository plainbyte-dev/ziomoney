"use client";

import { useState } from "react";
import SelectField from "./SelectField";
import DateField from "./DateField";
import RadioPill from "./RadioPill";
import Checkbox from "./Checkbox";
import Button from "./Button";
import { useTabs } from "@/contexts/TabsContext";
import {
  countryOptions,
  beneficiaryCountryOptions,
  payoutPartnerOptions,
  tnxDateOptions,
  reportDefaults,
} from "@/data/staticData";

type PartnerWiseOption = "send" | "payout";

export default function CorrespondenceReportCard() {
  const { openTab } = useTabs();
  const [partnerWise, setPartnerWise] = useState<PartnerWiseOption>("send");
  const [exportToExcel, setExportToExcel] = useState(true);

  function handleViewFullReport() {
    openTab({
      key: "correspondence-report-results",
      title: "Report Results",
      closable: true,
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">Correspondence Report</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Money-transfer correspondence between sending and payout partners, tracked
          from customer collection through to head-office settlement.
        </p>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="rounded-2xl border border-border bg-panel p-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField
              label="Sending Country"
              options={countryOptions}
              defaultValue={reportDefaults.sendingCountry}
            />
            <SelectField
              label="Beneficiary Country"
              options={beneficiaryCountryOptions}
              defaultValue={reportDefaults.beneficiaryCountry}
            />
            <SelectField
              label="Payout Partner"
              options={payoutPartnerOptions}
              defaultValue={reportDefaults.payoutPartner}
            />
            <SelectField
              label="Beneficiary Country"
              options={beneficiaryCountryOptions}
              defaultValue={reportDefaults.beneficiaryCountry2}
            />

            <SelectField
              label="Confirm/TNX"
              options={tnxDateOptions}
              defaultValue={reportDefaults.confirmTnx}
              required
            />
            <DateField label="From" defaultValue={reportDefaults.fromDate} />
            <DateField label="To" defaultValue={reportDefaults.toDate} />
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              <RadioPill
                label="Send Partner Wise"
                checked={partnerWise === "send"}
                onSelect={() => setPartnerWise("send")}
              />
              <RadioPill
                label="Payout Partner Wise"
                checked={partnerWise === "payout"}
                onSelect={() => setPartnerWise("payout")}
              />
            </div>

            <Checkbox
              label="Export To Excel"
              checked={exportToExcel}
              onToggle={() => setExportToExcel((v) => !v)}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button onClick={handleViewFullReport}>View Full Report</Button>
          <Button variant="secondary">Reset</Button>
        </div>
      </div>
    </div>
  );
}
