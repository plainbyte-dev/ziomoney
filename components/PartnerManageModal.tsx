"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Button from "./Button";
import TextField from "./TextField";
import SelectField from "./SelectField";
import CurrencySelect from "./CurrencySelect";
import Checkbox from "./Checkbox";
import { usePartners } from "@/contexts/PartnersContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { settlementCurrencyOptions, type PartnerEntry } from "@/data/partnerData";
import {
  updateRemittancePartnerEmail,
  updateRemittancePartnerAcceptPin,
  insertRemittancePartnerTxnCurrency,
  changeRemittancePartnerPassword,
} from "@/lib/partnersApi";

function inputClass(error?: boolean) {
  return `w-full rounded-xl border bg-panel px-3 py-2.5 text-sm text-heading placeholder:text-muted transition-colors focus:outline-none focus:ring-1 ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-red-400"
      : "border-border focus:border-brand-green focus:ring-brand-green"
  }`;
}

export default function PartnerManageModal({
  entry,
  onClose,
}: {
  entry: PartnerEntry | null;
  onClose: () => void;
}) {
  const { updateEntry } = usePartners();
  const { notify } = useNotifications();
  const { isLive } = useDataMode();

  const [email, setEmail] = useState(entry?.email ?? "");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const [acceptPin, setAcceptPin] = useState(entry?.acceptPartnerPin ?? false);
  const [pinSaving, setPinSaving] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const [currency, setCurrency] = useState(settlementCurrencyOptions[0]);
  const [currencySaving, setCurrencySaving] = useState(false);
  const [currencyError, setCurrencyError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (!entry) return null;
  const userName = entry.partnerName;

  async function handleSaveEmail() {
    setEmailError(null);
    setEmailSaving(true);
    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateEntry(entry!.id, { email });
      notify({ title: "Email updated", message: `${userName}'s contact email was updated.` });
      setEmailSaving(false);
      return;
    }
    const response = await updateRemittancePartnerEmail(userName, email);
    setEmailSaving(false);
    if (!response.success) {
      setEmailError(response.message || "Could not update the email.");
      return;
    }
    updateEntry(entry!.id, { email });
    notify({ title: "Email updated", message: `${userName}'s contact email was updated.` });
  }

  async function handleSavePin() {
    setPinError(null);
    setPinSaving(true);
    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateEntry(entry!.id, { acceptPartnerPin: acceptPin });
      notify({ title: "Accept PIN updated", message: `${userName} ${acceptPin ? "now accepts" : "no longer accepts"} PIN confirmations.` });
      setPinSaving(false);
      return;
    }
    const response = await updateRemittancePartnerAcceptPin(userName, acceptPin);
    setPinSaving(false);
    if (!response.success) {
      setPinError(response.message || "Could not update accept-PIN setting.");
      return;
    }
    updateEntry(entry!.id, { acceptPartnerPin: acceptPin });
    notify({ title: "Accept PIN updated", message: `${userName} ${acceptPin ? "now accepts" : "no longer accepts"} PIN confirmations.` });
  }

  async function handleAddCurrency() {
    setCurrencyError(null);
    if (entry!.txnCurrencies?.includes(currency)) {
      setCurrencyError(`${currency} is already enabled for this partner.`);
      return;
    }
    setCurrencySaving(true);
    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateEntry(entry!.id, { txnCurrencies: [...(entry!.txnCurrencies ?? []), currency] });
      notify({ title: "Transaction currency added", message: `${userName} can now send ${currency}.` });
      setCurrencySaving(false);
      return;
    }
    const response = await insertRemittancePartnerTxnCurrency(userName, currency);
    setCurrencySaving(false);
    if (!response.success) {
      setCurrencyError(response.message || "Could not add the transaction currency.");
      return;
    }
    updateEntry(entry!.id, { txnCurrencies: [...(entry!.txnCurrencies ?? []), currency] });
    notify({ title: "Transaction currency added", message: `${userName} can now send ${currency}.` });
  }

  async function handleChangePassword() {
    setPasswordError(null);
    if (!newPassword || newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      notify({ title: "Password changed", message: `${userName}'s API password was rotated.` });
      setPasswordSaving(false);
      setNewPassword("");
      setConfirmPassword("");
      return;
    }
    const response = await changeRemittancePartnerPassword(userName, newPassword);
    setPasswordSaving(false);
    if (!response.success) {
      setPasswordError(response.message || "Could not change the password.");
      return;
    }
    notify({ title: "Password changed", message: `${userName}'s API password was rotated.` });
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-panel p-6 shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted">MANAGE PARTNER</p>
            <h2 className="text-lg font-bold text-heading">{entry.partnerName}</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-heading">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-6">
          <section className="border-t border-border pt-5">
            <p className="mb-3 text-sm font-semibold text-heading/70">Contact Email</p>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <TextField label="Email:" value={email} onChange={setEmail} />
              </div>
              <Button variant="secondary" size="md" onClick={handleSaveEmail} loading={emailSaving}>
                Update
              </Button>
            </div>
            {emailError && <p className="mt-2 text-xs text-red-600">{emailError}</p>}
          </section>

          <section className="border-t border-border pt-5">
            <p className="mb-3 text-sm font-semibold text-heading/70">PIN Confirmation</p>
            <div className="flex items-center justify-between gap-3">
              <Checkbox checked={acceptPin} onToggle={() => setAcceptPin((v) => !v)} label="Accept Partner PIN" />
              <Button variant="secondary" size="md" onClick={handleSavePin} loading={pinSaving}>
                Update
              </Button>
            </div>
            {pinError && <p className="mt-2 text-xs text-red-600">{pinError}</p>}
          </section>

          <section className="border-t border-border pt-5">
            <p className="mb-3 text-sm font-semibold text-heading/70">Transaction Currencies</p>
            {entry.txnCurrencies && entry.txnCurrencies.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {entry.txnCurrencies.map((code) => (
                  <span
                    key={code}
                    className="rounded-full bg-brand-blue-light px-2.5 py-1 text-xs font-semibold text-brand-blue"
                  >
                    {code}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <CurrencySelect
                  label="Currency:"
                  options={settlementCurrencyOptions}
                  value={currency}
                  onChange={setCurrency}
                />
              </div>
              <Button variant="secondary" size="md" onClick={handleAddCurrency} loading={currencySaving}>
                Add
              </Button>
            </div>
            {currencyError && <p className="mt-2 text-xs text-red-600">{currencyError}</p>}
          </section>

          <section className="border-t border-border pt-5">
            <p className="mb-3 text-sm font-semibold text-heading/70">Change API Password</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-heading/70">New Password:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className={inputClass()}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-heading/70">Confirm Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={inputClass()}
                />
              </div>
            </div>
            {passwordError && <p className="mt-2 text-xs text-red-600">{passwordError}</p>}
            <div className="mt-3">
              <Button variant="secondary" size="md" onClick={handleChangePassword} loading={passwordSaving}>
                Change Password
              </Button>
            </div>
          </section>
        </div>

        <div className="mt-6 flex justify-end border-t border-border pt-5">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
