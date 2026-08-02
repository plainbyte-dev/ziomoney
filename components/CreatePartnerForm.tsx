"use client";

import { useState } from "react";
import TextField from "./TextField";
import SelectField from "./SelectField";
import DateField from "./DateField";
import Checkbox from "./Checkbox";
import { useTabs } from "@/contexts/TabsContext";
import { usePartners } from "@/contexts/PartnersContext";
import {
  partnerCountrySelectOptions,
  partnerTypeOptions,
  restrictPaymentOptions,
  partnerRightsOptions,
  dateFormatOptions,
  partnerSettlementOptions,
  localTimeOptions,
  partnerLocalCurrencyOptions,
  type PartnerEntry,
} from "@/data/partnerData";

export default function CreatePartnerForm() {
  const { openTab } = useTabs();
  const { entries, addEntry } = usePartners();

  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState(partnerCountrySelectOptions[0]);
  const [partnerType, setPartnerType] = useState(partnerTypeOptions[0]);
  const [blocked, setBlocked] = useState(false);

  const [coverFundLimit, setCoverFundLimit] = useState(false);
  const [makerChecker, setMakerChecker] = useState(false);
  const [userCashMgmt, setUserCashMgmt] = useState(false);
  const [calcPayoutDaily, setCalcPayoutDaily] = useState(false);

  const [smsToSender, setSmsToSender] = useState(false);
  const [smsToBeneficiary, setSmsToBeneficiary] = useState(false);
  const [preFundingPartner, setPreFundingPartner] = useState(false);
  const [allowPinnoAccept, setAllowPinnoAccept] = useState(false);
  const [enableApprovalPassword, setEnableApprovalPassword] = useState(false);
  const [disableTxnApprove, setDisableTxnApprove] = useState(false);

  const [saving, setSaving] = useState(false);

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    const entry: PartnerEntry = {
      id: `${11000000 + entries.length + 1}`,
      partnerName: companyName || "New Partner",
      partnerId: "",
      country: country.toUpperCase(),
      partnerType: partnerType.replace(" Agent", ""),
      creditLimit: null,
      hasBank: false,
      blocked,
    };

    setTimeout(() => {
      addEntry(entry);
      openTab({ key: "partner-info", title: "Partner Info" });
    }, 400);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="bg-brand-blue px-6 py-4">
        <h1 className="text-lg font-bold text-white">New Partner</h1>
      </div>

      <form onSubmit={handleSave} className="bg-panel p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <TextField label="Contact Person:" required />
          <TextField label="Post:" required />
          <TextField label="Email:" required />
          <div />
          <TextField label="Contact Person:" />
          <TextField label="Post:" />
          <TextField label="Email:" />
          <div />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 border-t border-border pt-5 sm:grid-cols-2">
          <TextField
            label="Company Name:"
            required
            placeholder="e.g. TRANS CASH INTERNATIONAL"
          />
          <TextField label="Partner ID:" />
          <SelectField label="Partner Type:" options={partnerTypeOptions} defaultValue={partnerTypeOptions[0]} />
          <TextField label="Business License:" />
          <TextField label="Address:" required />
          <DateField label="Date of Agreement:" defaultValue="" />
          <TextField label="City:" required />
          <SelectField label="Country:" options={partnerCountrySelectOptions} defaultValue={partnerCountrySelectOptions[0]} />
          <TextField label="Phone1:" required />
          <TextField label="Phone2:" />
          <TextField label="Fax No:" />
          <TextField label="Ext Partner ID:" />
          <TextField label="Email" />
          <div className="flex items-end pb-2.5">
            <Checkbox
              checked={blocked}
              onToggle={() => setBlocked((v) => !v)}
              label="Block this partner:"
              className="flex-row-reverse justify-end gap-2 text-heading/70"
            />
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <p className="text-sm font-semibold text-heading/70">Account Detail:</p>
          <div className="mt-3 flex flex-wrap items-center gap-6 border-b border-border pb-4">
            <Checkbox
              checked={coverFundLimit}
              onToggle={() => setCoverFundLimit((v) => !v)}
              label="Cover Fund Limit (Payout Agent)"
              className="font-semibold"
            />
            <Checkbox
              checked={makerChecker}
              onToggle={() => setMakerChecker((v) => !v)}
              label="Maker/Checker Enable"
              className="font-semibold"
            />
            <Checkbox
              checked={userCashMgmt}
              onToggle={() => setUserCashMgmt((v) => !v)}
              label="User Cash Mgmt Enable"
              className="font-semibold"
            />
            <Checkbox
              checked={calcPayoutDaily}
              onToggle={() => setCalcPayoutDaily((v) => !v)}
              label="Calculate Payout Commission Daily"
              className="font-semibold"
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <TextField label="Credit Limitation to SND TRN" defaultValue="0" />
            <SelectField
              label="Local Currency:"
              options={partnerLocalCurrencyOptions}
              defaultValue={partnerLocalCurrencyOptions[0]}
            />
            <TextField label="Limit Per Transaction Send" defaultValue="0" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Max Payout Amt Per TXN(Cash Pay):</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  defaultValue="0"
                  className="w-32 rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                />
                <span className="text-xs italic text-muted">Blank or Zero means Unlimited</span>
              </div>
            </div>
            <TextField label="Mileage Defined" defaultValue="0" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Max Payout Amt Per TXN(AC deposit):</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  defaultValue="0"
                  className="w-32 rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                />
                <span className="text-xs italic text-muted">
                  Blank or Zero means takes value from Cash Pay
                </span>
              </div>
            </div>
            <div />
            <SelectField
              label="Partner Settlement In:"
              options={partnerSettlementOptions}
              defaultValue={partnerSettlementOptions[0]}
            />
            <SelectField label="Partner Rights:" options={partnerRightsOptions} defaultValue={partnerRightsOptions[0]} />
            <SelectField label="Date Format:" options={dateFormatOptions} defaultValue={dateFormatOptions[0]} />
          </div>

          <div className="mt-5 flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Local Time:</label>
            <div className="flex flex-wrap items-center gap-3">
              <select
                defaultValue={localTimeOptions[0]}
                className="w-full max-w-md rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
              >
                {localTimeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="text-sm text-muted">Greenwich Mean Time</span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Remarks:</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5">
            <div className="flex flex-wrap items-center gap-6">
              <Checkbox
                checked={smsToSender}
                onToggle={() => setSmsToSender((v) => !v)}
                label="SMS NOTIFICATION TO SENDER"
                className="font-semibold uppercase text-xs"
              />
              <div className="flex items-center gap-2">
                <label className="text-sm text-heading/70">Mobile Format:</label>
                <input className="w-40 rounded-lg border border-border bg-white px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-heading/70">Mobile Digit: Min.</label>
                <input className="w-16 rounded-lg border border-border bg-white px-2 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green" />
                <label className="text-sm text-heading/70">Max.</label>
                <input className="w-16 rounded-lg border border-border bg-white px-2 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Checkbox
                checked={smsToBeneficiary}
                onToggle={() => setSmsToBeneficiary((v) => !v)}
                label="SMS NOTIFICATION TO BENEFICIARY"
                className="font-semibold uppercase text-xs"
              />
              <div className="flex items-center gap-2">
                <label className="text-sm text-heading/70">Country Code:</label>
                <input className="w-40 rounded-lg border border-border bg-white px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green" />
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-start gap-6 border-t border-border pt-5">
            <Checkbox
              checked={preFundingPartner}
              onToggle={() => setPreFundingPartner((v) => !v)}
              label="Is this a Pre-Funding Partner"
              className="font-semibold"
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <label className="text-sm text-heading/70">Alert notification if balance below</label>
                <input className="w-32 rounded-lg border border-border bg-white px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green" />
              </div>
              <span className="text-xs text-muted">if partner is Prepaid agent</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-heading/70">Branch Limit To Make A payment:</label>
              <input className="w-32 rounded-lg border border-border bg-white px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-border pt-5 sm:grid-cols-2">
            <SelectField
              label="Restrict Payment for Cash:"
              options={restrictPaymentOptions}
              defaultValue={restrictPaymentOptions[0]}
            />
            <div className="flex items-end pb-2.5">
              <Checkbox
                checked={allowPinnoAccept}
                onToggle={() => setAllowPinnoAccept((v) => !v)}
                label="Allow Their PINNO to Accept (API Agent)"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-heading/70">Enable Approval Password:</label>
              <Checkbox checked={enableApprovalPassword} onToggle={() => setEnableApprovalPassword((v) => !v)} />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-heading/70">Disable Txn Approve:</label>
              <Checkbox checked={disableTxnApprove} onToggle={() => setDisableTxnApprove((v) => !v)} />
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-brand-green px-8 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <p className="mt-2 text-xs text-red-500">* are required fields</p>
        </div>
      </form>
    </div>
  );
}
