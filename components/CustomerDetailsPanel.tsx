import KycMethodPanel from "./KycMethodPanel";
import PersonalContactDetailsForm from "./PersonalContactDetailsForm";
import AdditionalInformationForm from "./AdditionalInformationForm";

export default function CustomerDetailsPanel() {
  return (
    <div className="flex flex-col gap-6">
      <KycMethodPanel />
      <PersonalContactDetailsForm />
      <AdditionalInformationForm />
    </div>
  );
}
