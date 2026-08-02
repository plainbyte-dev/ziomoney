import ReportResults from "./ReportResults";

export default function CorrespondenceReportResultsPanel() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="bg-brand-blue px-6 py-4">
        <h1 className="text-lg font-bold text-white">Correspondence Report — Results</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <ReportResults />
      </div>
    </div>
  );
}
