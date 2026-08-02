import KycMethodPanel from "./KycMethodPanel";
import CompanyProfileForm from "./CompanyProfileForm";

export default function CorporateCustomerPanel() {
  return (
    <div className="flex flex-col gap-6">
      <KycMethodPanel />
      <CompanyProfileForm />
    </div>
  );
}
