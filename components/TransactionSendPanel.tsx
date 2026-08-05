"use client";

import { useMemo, useState } from "react";
import { ChevronRight, CheckCircle2, Search, ZoomIn, X, Calculator } from "lucide-react";
import {
  sendPartnerOptions,
  sendBranchOptions,
  sendCountryOptions,
  sendMethodOptions,
  tradeRestrictionItems,
  genderOptions,
  idTypeOptions,
  photoIdTypeOptions,
  japanPrefectureOptions,
  discountOptions,
  payoutPartnerBankOptions,
  collectMethodOptions,
  type CollectMethod,
} from "@/data/transactionSendData";
import {
  senderOccupationRiskScores,
  reasonForRemittanceRiskScores,
  sourceOfIncomeRiskScores,
  relationRiskScores,
  customerVisaTypeRiskScores,
  countryRiskScores,
} from "@/data/riskProfilingData";
import { beneficiaryRecords } from "@/data/beneficiaryData";
import { exchangeRateRecords } from "@/data/exchangeRateData";

type Step = "partner" | "declaration" | "remitter" | "beneficiary" | "transaction" | "done";

const countryNames = countryRiskScores.map((c) => c.label);
const occupationOptions = senderOccupationRiskScores.map((r) => r.label);
const purposeOfRemittanceOptions = reasonForRemittanceRiskScores.map((r) => r.label);
const sourceOfIncomeOptions = sourceOfIncomeRiskScores.map((r) => r.label);
const relationshipOptions = relationRiskScores.map((r) => r.label);
const visaStatusOptions = customerVisaTypeRiskScores.map((r) => r.label);

const MAX_LIMIT_JPY = 4006400;
const FLAT_SERVICE_CHARGE_JPY = 500;

interface RemitterForm {
  payoutCountry: string;
  customerSearch: string;
  lastName: string;
  firstName: string;
  middleName: string;
  depositorName: string;
  emailId: string;
  sendEmail: boolean;
  zipCode: string;
  town: string;
  city: string;
  state: string;
  mobileNo: string;
  smsEnabled: boolean;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  visaStatus: string;
  employerName: string;
  primaryIdType: string;
  primaryIdNumber: string;
  placeOfIssue: string;
  issueDate: string;
  expireDate: string;
}

const emptyRemitter: RemitterForm = {
  payoutCountry: sendCountryOptions[0],
  customerSearch: "",
  lastName: "",
  firstName: "",
  middleName: "",
  depositorName: "",
  emailId: "",
  sendEmail: false,
  zipCode: "",
  town: "",
  city: "",
  state: "",
  mobileNo: "",
  smsEnabled: true,
  gender: "",
  dateOfBirth: "",
  nationality: "",
  visaStatus: "",
  employerName: "",
  primaryIdType: "",
  primaryIdNumber: "",
  placeOfIssue: "",
  issueDate: "",
  expireDate: "",
};

interface SecurityForm {
  myNumber: string;
  occupation: string;
  secondaryIdType: string;
  secondaryIdNumber: string;
  purposeOfRemittance: string;
  issueOnCountry: string;
  sourceOfIncome: string;
  issueDate: string;
  expireDate: string;
  relationshipToBeneficiary: string;
}

const emptySecurity: SecurityForm = {
  myNumber: "",
  occupation: "",
  secondaryIdType: "",
  secondaryIdNumber: "",
  purposeOfRemittance: "",
  issueOnCountry: "",
  sourceOfIncome: "",
  issueDate: "",
  expireDate: "",
  relationshipToBeneficiary: "",
};

interface BeneficiaryForm {
  chooseReceiver: string;
  lastName: string;
  firstName: string;
  middleName: string;
  photoIdType: string;
  address: string;
  idNumber: string;
  city: string;
  placeOfIssue: string;
  contactNo: string;
  paymentType: string;
  receiverEmail: string;
  payoutPartnerBank: string;
  branchNameOrIfsc: string;
}

const emptyBeneficiary: BeneficiaryForm = {
  chooseReceiver: "New Receiver",
  lastName: "",
  firstName: "",
  middleName: "",
  photoIdType: photoIdTypeOptions[0],
  address: "",
  idNumber: "",
  city: "",
  placeOfIssue: "",
  contactNo: "",
  paymentType: "C-CASH PAY",
  receiverEmail: "",
  payoutPartnerBank: payoutPartnerBankOptions[0],
  branchNameOrIfsc: "",
};

export default function TransactionSendPanel() {
  const [step, setStep] = useState<Step>("partner");

  const [partnerId, setPartnerId] = useState(sendPartnerOptions[0]);
  const [branchName, setBranchName] = useState(sendBranchOptions[0]);
  const [country, setCountry] = useState(sendCountryOptions[0]);
  const [method, setMethod] = useState(sendMethodOptions[0]);

  const [declarations, setDeclarations] = useState<boolean[]>(tradeRestrictionItems.map(() => true));

  const [remitter, setRemitter] = useState<RemitterForm>({ ...emptyRemitter, payoutCountry: country });
  const [security, setSecurity] = useState<SecurityForm>(emptySecurity);
  const [beneficiary, setBeneficiary] = useState<BeneficiaryForm>(emptyBeneficiary);

  const [collectMethod, setCollectMethod] = useState<CollectMethod>(collectMethodOptions[0]);
  const [discount, setDiscount] = useState(discountOptions[0]);
  const [transferAmountLC, setTransferAmountLC] = useState("0.00");
  const [customerRate, setCustomerRate] = useState(0);
  const [customerRateEditable, setCustomerRateEditable] = useState(false);
  const [payoutAmountFC, setPayoutAmountFC] = useState(0);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [additionalFee, setAdditionalFee] = useState(0);
  const [collectedAmount, setCollectedAmount] = useState(0);
  const [receiveAmount, setReceiveAmount] = useState(0);
  const [memo, setMemo] = useState("");
  const [hasCalculated, setHasCalculated] = useState(false);

  const rate = useMemo(
    () => exchangeRateRecords.find((r) => r.countryName.toLowerCase() === remitter.payoutCountry.toLowerCase()),
    [remitter.payoutCountry]
  );

  function setDeclaration(index: number, value: boolean) {
    setDeclarations((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  function updateRemitter<K extends keyof RemitterForm>(field: K, value: RemitterForm[K]) {
    setRemitter((prev) => ({ ...prev, [field]: value }));
  }

  function updateSecurity<K extends keyof SecurityForm>(field: K, value: SecurityForm[K]) {
    setSecurity((prev) => ({ ...prev, [field]: value }));
  }

  function updateBeneficiary<K extends keyof BeneficiaryForm>(field: K, value: BeneficiaryForm[K]) {
    setBeneficiary((prev) => ({ ...prev, [field]: value }));
  }

  function pickExistingReceiver(fullName: string) {
    updateBeneficiary("chooseReceiver", fullName);
    if (fullName === "New Receiver") {
      setBeneficiary({ ...emptyBeneficiary, chooseReceiver: "New Receiver" });
      return;
    }
    const existing = beneficiaryRecords.find((b) => b.fullName === fullName);
    if (!existing) return;
    const [firstName, ...rest] = existing.fullName.split(" ");
    setBeneficiary((prev) => ({
      ...prev,
      chooseReceiver: fullName,
      firstName,
      lastName: rest.join(" "),
      contactNo: existing.phone,
      receiverEmail: existing.email,
      city: existing.bankBranch,
      branchNameOrIfsc: existing.accountNumber,
    }));
  }

  const remitterValid =
    remitter.payoutCountry &&
    remitter.lastName.trim() &&
    remitter.firstName.trim() &&
    remitter.zipCode.trim() &&
    remitter.city.trim() &&
    remitter.mobileNo.trim() &&
    remitter.gender &&
    remitter.dateOfBirth &&
    remitter.nationality &&
    remitter.placeOfIssue &&
    remitter.issueDate;

  const beneficiaryValid =
    security.occupation &&
    security.purposeOfRemittance &&
    security.sourceOfIncome &&
    security.relationshipToBeneficiary &&
    beneficiary.lastName.trim() &&
    beneficiary.firstName.trim() &&
    beneficiary.address.trim() &&
    beneficiary.contactNo.trim() &&
    beneficiary.branchNameOrIfsc.trim();

  function handleCalculate() {
    const lc = Number(transferAmountLC) || 0;
    const unit = rate?.unit ?? 1;
    const sellingRate = customerRateEditable && customerRate > 0 ? customerRate : rate?.selling ?? 1;
    const fc = sellingRate > 0 ? Math.round((lc / sellingRate) * unit) : 0;
    const fee = lc > 0 ? FLAT_SERVICE_CHARGE_JPY : 0;

    setCustomerRate(sellingRate);
    setPayoutAmountFC(fc);
    setServiceCharge(fee);
    setAdditionalFee(0);
    setCollectedAmount(lc + fee);
    setReceiveAmount(fc);
    setHasCalculated(true);
  }

  function handleReset() {
    setTransferAmountLC("0.00");
    setDiscount(discountOptions[0]);
    setCustomerRate(0);
    setCustomerRateEditable(false);
    setPayoutAmountFC(0);
    setServiceCharge(0);
    setAdditionalFee(0);
    setCollectedAmount(0);
    setReceiveAmount(0);
    setMemo("");
    setHasCalculated(false);
  }

  const transactionValid = hasCalculated && Number(transferAmountLC) > 0;

  if (step === "partner") {
    return (
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="bg-brand-blue px-6 py-4">
          <h1 className="text-lg font-bold text-white">Select Partner to Send Transaction</h1>
        </div>

        <div className="bg-panel p-6 sm:p-8">
          <div className="max-w-xl space-y-4">
            <FormRow label="Partner ID:">
              <Select value={partnerId} onChange={setPartnerId} options={sendPartnerOptions} />
            </FormRow>
            <FormRow label="Branch Name:">
              <Select value={branchName} onChange={setBranchName} options={sendBranchOptions} />
            </FormRow>
            <FormRow label="Country:">
              <Select
                value={country}
                onChange={(value) => {
                  setCountry(value);
                  updateRemitter("payoutCountry", value);
                }}
                options={sendCountryOptions}
              />
            </FormRow>
            <FormRow label="Method:">
              <Select value={method} onChange={setMethod} options={sendMethodOptions} />
            </FormRow>

            <StepButton onClick={() => setStep("declaration")}>Continue</StepButton>
          </div>
        </div>
      </div>
    );
  }

  if (step === "declaration") {
    return (
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="bg-brand-blue px-6 py-4">
          <h1 className="text-sm font-bold text-white sm:text-base">
            Trade Restrictions and Use of Funds Restrictions must be cleared prior to the client before the
            declaration.
          </h1>
        </div>

        <div className="bg-panel p-6 sm:p-8">
          <div className="space-y-3">
            {tradeRestrictionItems.map((item, index) => (
              <div key={item.label} className="flex flex-wrap items-center gap-x-10 gap-y-2">
                <span className="min-w-[280px] text-sm text-heading/80">{item.label}</span>
                <label className="flex items-center gap-1.5 text-sm text-heading/80">
                  <input
                    type="checkbox"
                    checked={declarations[index]}
                    onChange={() => setDeclaration(index, true)}
                    className="h-4 w-4 rounded border-border text-brand-blue focus:ring-brand-blue"
                  />
                  N/A
                </label>
                <label className="flex items-center gap-1.5 text-sm text-heading/80">
                  <input
                    type="checkbox"
                    checked={!declarations[index]}
                    onChange={() => setDeclaration(index, false)}
                    className="h-4 w-4 rounded border-border text-brand-blue focus:ring-brand-blue"
                  />
                  Yes
                </label>
              </div>
            ))}

            <StepButton onClick={() => setStep("remitter")}>Continue</StepButton>
          </div>
        </div>
      </div>
    );
  }

  if (step === "remitter") {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-surface px-4 py-2 text-xs font-medium text-heading/70">
          Remittance Detail Form [ Your Current User TXN Collect Limit Left: {formatAmount(MAX_LIMIT_JPY)} JPY ]
        </p>

        <div className="overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="bg-brand-blue px-6 py-3">
            <h2 className="text-sm font-bold uppercase text-white">Search Customer</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 bg-blue-50 p-4">
            <span className="text-xs font-semibold text-heading/70">
              Payout Country <span className="text-red-500">*</span>
            </span>
            <Select
              value={remitter.payoutCountry}
              onChange={(value) => updateRemitter("payoutCountry", value)}
              options={sendCountryOptions}
              className="w-40"
            />
            <input
              type="text"
              placeholder="Search customer / user ID"
              value={remitter.customerSearch}
              onChange={(event) => updateRemitter("customerSearch", event.target.value)}
              className="min-w-[220px] flex-1 rounded-lg border border-border px-3 py-1.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
            <IconButton icon={Search} />
            <IconButton icon={ZoomIn} />
            <IconButton icon={X} onClick={() => updateRemitter("customerSearch", "")} />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="bg-red-600 px-6 py-3">
            <h2 className="text-sm font-bold uppercase text-white">Remitter Detail</h2>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-4 bg-red-50 p-6 sm:grid-cols-2">
            <FormRow label="Senders Name:" required>
              <div className="flex gap-2">
                <input
                  placeholder="Last Name"
                  value={remitter.lastName}
                  onChange={(event) => updateRemitter("lastName", event.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="First Name"
                  value={remitter.firstName}
                  onChange={(event) => updateRemitter("firstName", event.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="Middle Name"
                  value={remitter.middleName}
                  onChange={(event) => updateRemitter("middleName", event.target.value)}
                  className={inputClass}
                />
              </div>
            </FormRow>
            <FormRow label="Visa Status">
              <Select value={remitter.visaStatus} onChange={(v) => updateRemitter("visaStatus", v)} options={visaStatusOptions} placeholder="--SELECT--" />
            </FormRow>

            <FormRow label="Depositor Name:">
              <input value={remitter.depositorName} onChange={(event) => updateRemitter("depositorName", event.target.value)} className={inputClass} />
            </FormRow>
            <FormRow label="Name of Employer:">
              <input value={remitter.employerName} onChange={(event) => updateRemitter("employerName", event.target.value)} className={inputClass} />
            </FormRow>

            <FormRow label="Email ID:">
              <div className="flex items-center gap-2">
                <input value={remitter.emailId} onChange={(event) => updateRemitter("emailId", event.target.value)} className={inputClass} />
                <label className="flex items-center gap-1 whitespace-nowrap text-xs text-heading/70">
                  <input type="checkbox" checked={remitter.sendEmail} onChange={(event) => updateRemitter("sendEmail", event.target.checked)} />
                  Send Email
                </label>
              </div>
            </FormRow>
            <FormRow label="Primary ID:">
              <div className="flex gap-2">
                <Select value={remitter.primaryIdType} onChange={(v) => updateRemitter("primaryIdType", v)} options={idTypeOptions} placeholder="--Select--" />
                <input value={remitter.primaryIdNumber} onChange={(event) => updateRemitter("primaryIdNumber", event.target.value)} className={inputClass} />
              </div>
            </FormRow>

            <FormRow label="Zip Code:" required>
              <input value={remitter.zipCode} onChange={(event) => updateRemitter("zipCode", event.target.value)} className={inputClass} />
            </FormRow>
            <FormRow label="Gender:" required>
              <Select value={remitter.gender} onChange={(v) => updateRemitter("gender", v)} options={genderOptions} placeholder="--SELECT--" />
            </FormRow>

            <FormRow label="Town:">
              <input value={remitter.town} onChange={(event) => updateRemitter("town", event.target.value)} className={inputClass} />
            </FormRow>
            <FormRow label="Date of Birth:" required>
              <input type="date" value={remitter.dateOfBirth} onChange={(event) => updateRemitter("dateOfBirth", event.target.value)} className={inputClass} />
            </FormRow>

            <FormRow label="City:" required>
              <input value={remitter.city} onChange={(event) => updateRemitter("city", event.target.value)} className={inputClass} />
            </FormRow>
            <FormRow label="Place of Issue:" required>
              <Select value={remitter.placeOfIssue} onChange={(v) => updateRemitter("placeOfIssue", v)} options={countryNames} placeholder="--SELECT COUNTRY--" />
            </FormRow>

            <FormRow label="State:">
              <div className="flex items-center gap-2">
                <Select value={remitter.state} onChange={(v) => updateRemitter("state", v)} options={japanPrefectureOptions} placeholder="--SELECT--" />
                <span className="text-sm font-semibold text-heading/70">JAPAN</span>
              </div>
            </FormRow>
            <FormRow label="Issue / Expire Date:" required>
              <div className="flex gap-2">
                <input type="date" value={remitter.issueDate} onChange={(event) => updateRemitter("issueDate", event.target.value)} className={inputClass} />
                <input type="date" value={remitter.expireDate} onChange={(event) => updateRemitter("expireDate", event.target.value)} className={inputClass} />
              </div>
            </FormRow>

            <FormRow label="Mobile No:" required>
              <div className="flex items-center gap-2">
                <input value={remitter.mobileNo} onChange={(event) => updateRemitter("mobileNo", event.target.value)} className={inputClass} />
                <label className="flex items-center gap-1 whitespace-nowrap text-xs text-heading/70">
                  <input type="checkbox" checked={remitter.smsEnabled} onChange={(event) => updateRemitter("smsEnabled", event.target.checked)} />
                  SMS
                </label>
              </div>
            </FormRow>
            <FormRow label="Nationality:" required>
              <Select value={remitter.nationality} onChange={(v) => updateRemitter("nationality", v)} options={countryNames} placeholder="--SELECT COUNTRY--" />
            </FormRow>
          </div>
        </div>

        <StepButton onClick={() => setStep("beneficiary")} disabled={!remitterValid}>
          Continue
        </StepButton>
      </div>
    );
  }

  if (step === "beneficiary") {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="bg-red-600 px-6 py-3">
            <h2 className="text-sm font-bold uppercase text-white">Security Information</h2>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-4 bg-red-50 p-6 sm:grid-cols-2">
            <FormRow label="My Number:">
              <input value={security.myNumber} onChange={(event) => updateSecurity("myNumber", event.target.value)} className={inputClass} />
            </FormRow>
            <FormRow label="Occupation:" required>
              <Select value={security.occupation} onChange={(v) => updateSecurity("occupation", v)} options={occupationOptions} placeholder="--SELECT--" />
            </FormRow>

            <FormRow label="Secondary ID:">
              <div className="flex gap-2">
                <Select value={security.secondaryIdType} onChange={(v) => updateSecurity("secondaryIdType", v)} options={idTypeOptions} placeholder="--Select--" />
                <input value={security.secondaryIdNumber} onChange={(event) => updateSecurity("secondaryIdNumber", event.target.value)} className={inputClass} />
              </div>
            </FormRow>
            <FormRow label="Purpose of Remittance:" required>
              <Select value={security.purposeOfRemittance} onChange={(v) => updateSecurity("purposeOfRemittance", v)} options={purposeOfRemittanceOptions} placeholder="--SELECT--" />
            </FormRow>

            <FormRow label="Issue On:">
              <Select value={security.issueOnCountry} onChange={(v) => updateSecurity("issueOnCountry", v)} options={countryNames} placeholder="--SELECT COUNTRY--" />
            </FormRow>
            <FormRow label="Source of Income:" required>
              <Select value={security.sourceOfIncome} onChange={(v) => updateSecurity("sourceOfIncome", v)} options={sourceOfIncomeOptions} placeholder="--SELECT--" />
            </FormRow>

            <FormRow label="Issue / Expire Date:">
              <div className="flex gap-2">
                <input type="date" value={security.issueDate} onChange={(event) => updateSecurity("issueDate", event.target.value)} className={inputClass} />
                <input type="date" value={security.expireDate} onChange={(event) => updateSecurity("expireDate", event.target.value)} className={inputClass} />
              </div>
            </FormRow>
            <FormRow label="Relationship to Beneficiary:" required>
              <Select value={security.relationshipToBeneficiary} onChange={(v) => updateSecurity("relationshipToBeneficiary", v)} options={relationshipOptions} placeholder="--SELECT--" />
            </FormRow>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="bg-brand-blue px-6 py-3">
            <h2 className="text-sm font-bold uppercase text-white">Beneficiary Detail</h2>
          </div>
          <div className="grid grid-cols-1 gap-x-10 gap-y-4 bg-blue-50 p-6 sm:grid-cols-2">
            <FormRow label="Choose Receiver:">
              <Select
                value={beneficiary.chooseReceiver}
                onChange={pickExistingReceiver}
                options={["New Receiver", ...beneficiaryRecords.map((b) => b.fullName)]}
              />
            </FormRow>
            <FormRow label="Photo ID Type:">
              <Select value={beneficiary.photoIdType} onChange={(v) => updateBeneficiary("photoIdType", v)} options={photoIdTypeOptions} />
            </FormRow>

            <FormRow label="Receiver's Name:" required>
              <div className="flex gap-2">
                <input placeholder="Last Name" value={beneficiary.lastName} onChange={(event) => updateBeneficiary("lastName", event.target.value)} className={inputClass} />
                <input placeholder="First Name" value={beneficiary.firstName} onChange={(event) => updateBeneficiary("firstName", event.target.value)} className={inputClass} />
                <input placeholder="Middle Name" value={beneficiary.middleName} onChange={(event) => updateBeneficiary("middleName", event.target.value)} className={inputClass} />
              </div>
            </FormRow>
            <FormRow label="ID Number:">
              <input value={beneficiary.idNumber} onChange={(event) => updateBeneficiary("idNumber", event.target.value)} className={inputClass} />
            </FormRow>

            <FormRow label="Address:" required>
              <input value={beneficiary.address} onChange={(event) => updateBeneficiary("address", event.target.value)} className={inputClass} />
            </FormRow>
            <FormRow label="Place of Issue:">
              <input value={beneficiary.placeOfIssue} onChange={(event) => updateBeneficiary("placeOfIssue", event.target.value)} className={inputClass} />
            </FormRow>

            <FormRow label="City:">
              <input value={beneficiary.city} onChange={(event) => updateBeneficiary("city", event.target.value)} className={inputClass} />
            </FormRow>
            <FormRow label="Payment Type:">
              <Select value={beneficiary.paymentType} onChange={(v) => updateBeneficiary("paymentType", v)} options={["C-CASH PAY", "Bank Transfer", "Wallet"]} />
            </FormRow>

            <FormRow label="Contact No:" required>
              <input value={beneficiary.contactNo} onChange={(event) => updateBeneficiary("contactNo", event.target.value)} className={inputClass} />
            </FormRow>
            <FormRow label="Payout Partner/Bank:">
              <div className="flex gap-2">
                <Select value={beneficiary.payoutPartnerBank} onChange={(v) => updateBeneficiary("payoutPartnerBank", v)} options={payoutPartnerBankOptions} />
                <button className="whitespace-nowrap rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-heading/80 hover:bg-border">
                  Branch
                </button>
              </div>
            </FormRow>

            <FormRow label="Receiver Email:">
              <input value={beneficiary.receiverEmail} onChange={(event) => updateBeneficiary("receiverEmail", event.target.value)} className={inputClass} />
            </FormRow>
            <FormRow label="Branch Name/IFSC Code:" required>
              <input value={beneficiary.branchNameOrIfsc} onChange={(event) => updateBeneficiary("branchNameOrIfsc", event.target.value)} className={inputClass} />
            </FormRow>
          </div>
        </div>

        <StepButton onClick={() => setStep("transaction")} disabled={!beneficiaryValid}>
          Continue
        </StepButton>
      </div>
    );
  }

  if (step === "transaction") {
    return (
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="bg-brand-blue px-6 py-3">
          <h2 className="text-sm font-bold uppercase text-white">Transaction Detail</h2>
        </div>

        <div className="space-y-4 bg-green-50 p-6">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-xs font-semibold uppercase text-heading/70">Amount Collect From Remitter:</span>
            {collectMethodOptions.map((option) => (
              <label key={option} className="flex items-center gap-1.5 text-sm text-heading/80">
                <input
                  type="radio"
                  name="collectMethod"
                  checked={collectMethod === option}
                  onChange={() => setCollectMethod(option)}
                  className="h-4 w-4 text-brand-blue focus:ring-brand-blue"
                />
                {option.toUpperCase()}
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold uppercase text-heading/70">
              Max Limit {formatAmount(MAX_LIMIT_JPY)} JPY
            </span>
            <Select value={discount} onChange={setDiscount} options={discountOptions} className="w-52" />
          </div>

          <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
            <FormRow label="Transfer Amount (LC):">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={transferAmountLC}
                  onChange={(event) => {
                    setTransferAmountLC(event.target.value);
                    setHasCalculated(false);
                  }}
                  className="w-full rounded-lg border border-border bg-yellow-100 px-3 py-1.5 text-right text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                />
                <span className="text-sm text-heading/70">JPY</span>
              </div>
            </FormRow>
            <FormRow label="Payout Amount (FC):">
              <div className="flex items-center gap-2">
                <div className="w-full rounded-lg border border-border bg-yellow-100 px-3 py-1.5 text-right text-sm font-semibold">
                  {formatAmount(payoutAmountFC)}
                </div>
              </div>
            </FormRow>

            <FormRow label="Service Charge:">
              <div className="flex items-center gap-2">
                <div className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-right text-sm text-heading/60">
                  {formatAmount(serviceCharge)}
                </div>
                <span className="text-sm text-heading/70">JPY</span>
              </div>
            </FormRow>
            <FormRow label="Customer Rate:">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs text-heading/70">
                  <input
                    type="checkbox"
                    checked={customerRateEditable}
                    onChange={(event) => setCustomerRateEditable(event.target.checked)}
                  />
                  Edit
                </label>
                <input
                  type="number"
                  value={customerRate}
                  disabled={!customerRateEditable}
                  onChange={(event) => setCustomerRate(Number(event.target.value))}
                  className="w-full rounded-lg border border-border px-3 py-1.5 text-right text-sm disabled:bg-surface disabled:text-heading/60"
                />
              </div>
            </FormRow>

            <FormRow label="Additional Fee:">
              <div className="flex items-center gap-2">
                <div className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-right text-sm text-heading/60">
                  {formatAmount(additionalFee)}
                </div>
                <span className="text-sm text-heading/70">JPY</span>
              </div>
            </FormRow>
            <div />

            <FormRow label="Collected Amount:">
              <div className="flex items-center gap-2">
                <div className="w-full rounded-lg border border-border bg-yellow-100 px-3 py-1.5 text-right text-sm font-semibold">
                  {formatAmount(collectedAmount)}
                </div>
                <span className="text-sm text-heading/70">JPY</span>
              </div>
            </FormRow>
            <FormRow label="Receive Amount:">
              <div className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-right text-sm text-heading/60">
                {formatAmount(receiveAmount)}
              </div>
            </FormRow>
          </div>

          <FormRow label="Memo:">
            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
          </FormRow>

          <div className="flex items-center gap-3 border-t border-border/60 pt-4">
            <button
              onClick={handleCalculate}
              disabled={Number(transferAmountLC) <= 0}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-heading/80 hover:bg-border disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Calculator size={14} />
              Calculate
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-heading/80 hover:bg-border"
            >
              <X size={14} />
              Reset
            </button>
            <button
              onClick={() => setStep("done")}
              disabled={!transactionValid}
              className="flex items-center gap-1 rounded-lg bg-heading px-4 py-2 text-sm font-semibold text-white hover:bg-heading/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="bg-brand-blue px-6 py-4">
        <h1 className="text-lg font-bold text-white">Send Transaction</h1>
      </div>

      <div className="bg-panel p-10 text-center">
        <CheckCircle2 size={40} className="mx-auto mb-3 text-brand-green" />
        <p className="text-sm font-medium text-heading">
          Transaction created: {remitter.firstName} {remitter.lastName} → {beneficiary.firstName}{" "}
          {beneficiary.lastName} for {formatAmount(receiveAmount)} via {partnerId}.
        </p>
        <button
          onClick={() => {
            setStep("partner");
            setRemitter(emptyRemitter);
            setSecurity(emptySecurity);
            setBeneficiary(emptyBeneficiary);
            handleReset();
          }}
          className="mt-4 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-heading/80 hover:bg-border"
        >
          Start New Transaction
        </button>
      </div>
    </div>
  );
}

function formatAmount(value: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const inputClass =
  "w-full rounded-lg border border-border px-3 py-1.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

function StepButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 rounded-lg bg-heading px-4 py-2 text-sm font-semibold text-white hover:bg-heading/90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <ChevronRight size={16} />
      {children}
    </button>
  );
}

function FormRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <span className="w-40 shrink-0 pt-1.5 text-sm text-heading/80">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="min-w-[220px] flex-1">{children}</div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green ${
        className ?? "w-full"
      }`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function IconButton({ icon: Icon, onClick }: { icon: typeof Search; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white text-heading/70 hover:bg-border"
    >
      <Icon size={14} />
    </button>
  );
}
