"use client";

import KycMethodPanel from "./KycMethodPanel";
import PersonalContactDetailsForm from "./PersonalContactDetailsForm";
import AdditionalInformationForm from "./AdditionalInformationForm";
import { useKyc } from "@/contexts/KycContext";

export default function CustomerDetailsPanel() {
  const { record, updateField } = useKyc();

  return (
    <div className="flex flex-col gap-6">
      <KycMethodPanel
        remarks={record.remarks}
        onRemarksChange={(value) => updateField("remarks", value)}
      />
      <PersonalContactDetailsForm />
      <AdditionalInformationForm />
    </div>
  );
}
